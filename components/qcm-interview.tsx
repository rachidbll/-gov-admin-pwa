"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Users, Play, SkipForward, Save, Camera, Mic, CheckCircle, Clock } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface User {
  id: string
  name: string
  email: string
  role: "admin" | "editor" | "filler" | "viewer"
}

interface Question {
  id: string
  type: "multiple-choice" | "checkbox" | "text" | "rating" | "yes-no"
  question: string
  options?: string[]
  required: boolean
  condition?: {
    dependsOn: string
    value: string
  }
}

interface QCMInterviewProps {
  user: User
}

const mockQuestions: Question[] = [
  {
    id: "1",
    type: "multiple-choice",
    question: "What is the primary purpose of your visit today?",
    options: ["New Registration", "Document Renewal", "Information Request", "Complaint Filing"],
    required: true,
  },
  {
    id: "2",
    type: "yes-no",
    question: "Do you have all required documents with you?",
    options: ["Yes", "No"],
    required: true,
  },
  {
    id: "3",
    type: "checkbox",
    question: "Which services are you interested in? (Select all that apply)",
    options: ["Online Portal Access", "Email Notifications", "SMS Updates", "Physical Mail"],
    required: false,
    condition: {
      dependsOn: "1",
      value: "New Registration",
    },
  },
  {
    id: "4",
    type: "rating",
    question: "How would you rate your previous experience with our services?",
    options: ["1", "2", "3", "4", "5"],
    required: false,
  },
  {
    id: "5",
    type: "text",
    question: "Please provide any additional comments or feedback:",
    required: false,
  },
]

export function QCMInterview({ user }: QCMInterviewProps) {
  const [isInterviewActive, setIsInterviewActive] = useState(false)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<{ [key: string]: any }>({})
  const [intervieweeInfo, setIntervieweeInfo] = useState({
    name: "",
    id: "",
    location: "",
  })
  const [isRecording, setIsRecording] = useState(false)
  const { toast } = useToast()

  const currentQuestion = mockQuestions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / mockQuestions.length) * 100

  const startInterview = () => {
    if (!intervieweeInfo.name.trim()) {
      toast({
        title: "Interviewee Information Required",
        description: "Please enter the interviewee's name before starting.",
        variant: "destructive",
      })
      return
    }
    setIsInterviewActive(true)
    setCurrentQuestionIndex(0)
    setAnswers({})
  }

  const handleAnswer = (questionId: string, answer: any) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }))
  }

  const nextQuestion = () => {
    if (currentQuestion.required && !answers[currentQuestion.id]) {
      toast({
        title: "Answer Required",
        description: "Please answer this question before proceeding.",
        variant: "destructive",
      })
      return
    }

    if (currentQuestionIndex < mockQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1)
    } else {
      completeInterview()
    }
  }

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1)
    }
  }

  const completeInterview = () => {
    toast({
      title: "Interview Completed",
      description: "All responses have been saved and will be synced to Google Sheets.",
    })
    setIsInterviewActive(false)
    setCurrentQuestionIndex(0)
    setAnswers({})
  }

  const saveProgress = () => {
    toast({
      title: "Progress Saved",
      description: "Interview progress has been saved. You can resume later.",
    })
  }

  const shouldShowQuestion = (question: Question) => {
    if (!question.condition) return true
    const dependentAnswer = answers[question.condition.dependsOn]
    return dependentAnswer === question.condition.value
  }

  const renderQuestion = (question: Question) => {
    const answer = answers[question.id]

    switch (question.type) {
      case "multiple-choice":
      case "yes-no":
        return (
          <RadioGroup value={answer || ""} onValueChange={(value) => handleAnswer(question.id, value)}>
            {question.options?.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`${question.id}-${option}`} />
                <Label htmlFor={`${question.id}-${option}`}>{option}</Label>
              </div>
            ))}
          </RadioGroup>
        )

      case "checkbox":
        return (
          <div className="space-y-2">
            {question.options?.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <Checkbox
                  id={`${question.id}-${option}`}
                  checked={answer?.includes(option) || false}
                  onCheckedChange={(checked) => {
                    const currentAnswers = answer || []
                    if (checked) {
                      handleAnswer(question.id, [...currentAnswers, option])
                    } else {
                      handleAnswer(
                        question.id,
                        currentAnswers.filter((a: string) => a !== option),
                      )
                    }
                  }}
                />
                <Label htmlFor={`${question.id}-${option}`}>{option}</Label>
              </div>
            ))}
          </div>
        )

      case "rating":
        return (
          <RadioGroup
            value={answer || ""}
            onValueChange={(value) => handleAnswer(question.id, value)}
            className="flex space-x-4"
          >
            {question.options?.map((option) => (
              <div key={option} className="flex flex-col items-center space-y-2">
                <RadioGroupItem value={option} id={`${question.id}-${option}`} />
                <Label htmlFor={`${question.id}-${option}`} className="text-sm">
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        )

      case "text":
        return (
          <Textarea
            value={answer || ""}
            onChange={(e) => handleAnswer(question.id, e.target.value)}
            placeholder="Enter your response..."
            className="min-h-[100px]"
          />
        )

      default:
        return null
    }
  }

  if (!isInterviewActive) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>QCM Field Interview</CardTitle>
            <CardDescription>
              Conduct structured interviews with multiple choice questions and conditional logic
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Interviewee Information */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="interviewee-name">Interviewee Name *</Label>
                <Input
                  id="interviewee-name"
                  value={intervieweeInfo.name}
                  onChange={(e) => setIntervieweeInfo((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter full name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="interviewee-id">ID Number</Label>
                <Input
                  id="interviewee-id"
                  value={intervieweeInfo.id}
                  onChange={(e) => setIntervieweeInfo((prev) => ({ ...prev, id: e.target.value }))}
                  placeholder="Government ID or reference"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="interview-location">Location</Label>
                <Input
                  id="interview-location"
                  value={intervieweeInfo.location}
                  onChange={(e) => setIntervieweeInfo((prev) => ({ ...prev, location: e.target.value }))}
                  placeholder="Interview location"
                />
              </div>
            </div>

            {/* Interview Preview */}
            <div className="border rounded-lg p-4 bg-gray-50">
              <h3 className="font-medium mb-3">Interview Preview</h3>
              <div className="space-y-2 text-sm">
                <p>
                  <strong>Total Questions:</strong> {mockQuestions.length}
                </p>
                <p>
                  <strong>Estimated Time:</strong> 5-10 minutes
                </p>
                <p>
                  <strong>Features:</strong> Auto-save, Media attachments, Conditional logic
                </p>
              </div>
            </div>

            <Button onClick={startInterview} className="w-full" size="lg">
              <Play className="mr-2 h-5 w-5" />
              Start Interview
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Interview Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Interview in Progress</span>
              </CardTitle>
              <CardDescription>
                Interviewing: {intervieweeInfo.name}
                {intervieweeInfo.location && ` • Location: ${intervieweeInfo.location}`}
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline">
                <Clock className="mr-1 h-3 w-3" />
                Question {currentQuestionIndex + 1} of {mockQuestions.length}
              </Badge>
              {isRecording && (
                <Badge variant="destructive">
                  <Mic className="mr-1 h-3 w-3" />
                  Recording
                </Badge>
              )}
            </div>
          </div>
          <Progress value={progress} className="mt-4" />
        </CardHeader>
      </Card>

      {/* Current Question */}
      {shouldShowQuestion(currentQuestion) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {currentQuestion.question}
              {currentQuestion.required && <span className="text-red-500 ml-1">*</span>}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {renderQuestion(currentQuestion)}

            {/* Media Attachments */}
            <div className="border-t pt-4">
              <Label className="text-sm font-medium">Optional Attachments</Label>
              <div className="flex space-x-2 mt-2">
                <Button variant="outline" size="sm">
                  <Camera className="mr-2 h-4 w-4" />
                  Take Photo
                </Button>
                <Button variant="outline" size="sm" onClick={() => setIsRecording(!isRecording)}>
                  <Mic className="mr-2 h-4 w-4" />
                  {isRecording ? "Stop Recording" : "Voice Note"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <div className="flex space-x-2">
          <Button variant="outline" onClick={previousQuestion} disabled={currentQuestionIndex === 0}>
            Previous
          </Button>
          <Button variant="outline" onClick={saveProgress}>
            <Save className="mr-2 h-4 w-4" />
            Save Progress
          </Button>
        </div>

        <Button onClick={nextQuestion}>
          {currentQuestionIndex === mockQuestions.length - 1 ? (
            <>
              <CheckCircle className="mr-2 h-4 w-4" />
              Complete Interview
            </>
          ) : (
            <>
              Next
              <SkipForward className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
