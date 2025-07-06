import { type NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";
import path from "path";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const pythonScriptPath = path.join(process.cwd(), "scripts", "excel_processor.py");

    return new Promise((resolve, reject) => {
      const pythonProcess = spawn("python", [pythonScriptPath, "ocr"]);

      let output = "";
      let errorOutput = "";

      pythonProcess.stdout.on("data", (data) => {
        output += data.toString();
      });

      pythonProcess.stderr.on("data", (data) => {
        errorOutput += data.toString();
      });

      pythonProcess.on("close", (code) => {
        if (code !== 0) {
          console.error(`Python script exited with code ${code}: ${errorOutput}`);
          reject(NextResponse.json({ error: `Python script error: ${errorOutput}` }, { status: 500 }));
          return;
        }

        try {
          const result = JSON.parse(output);
          resolve(NextResponse.json({ success: true, data: result }, { status: 200 }));
        } catch (parseError) {
          console.error("Failed to parse Python script output:", parseError);
          reject(NextResponse.json({ error: "Failed to parse Python script output" }, { status: 500 }));
        }
      });

      pythonProcess.stdin.write(buffer);
      pythonProcess.stdin.end();
    });
  } catch (error) {
    console.error("OCR processing API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
