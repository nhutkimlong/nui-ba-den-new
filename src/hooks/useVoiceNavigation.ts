import { useState, useEffect, useCallback, useRef } from 'react'

interface VoiceCommand {
  command: string
  action: () => void
  description: string
}

interface VoiceNavigationState {
  isListening: boolean
  isSupported: boolean
  transcript: string
  confidence: number
  error: string | null
}

export const useVoiceNavigation = () => {
  const [state, setState] = useState<VoiceNavigationState>({
    isListening: false,
    isSupported: false,
    transcript: '',
    confidence: 0,
    error: null
  })

  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const commandsRef = useRef<VoiceCommand[]>([])

  // Check if speech recognition is supported
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition
    
    if (SpeechRecognition) {
      setState(prev => ({ ...prev, isSupported: true }))
      
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = true
      recognitionRef.current.interimResults = true
      recognitionRef.current.lang = 'vi-VN'

      recognitionRef.current.onstart = () => {
        setState(prev => ({ ...prev, isListening: true, error: null }))
      }

      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscript = ''
        let interimTranscript = ''

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          const confidence = event.results[i][0].confidence

          if (event.results[i].isFinal) {
            finalTranscript += transcript
            setState(prev => ({ 
              ...prev, 
              transcript: finalTranscript,
              confidence 
            }))
            
            // Process commands
            processVoiceCommand(finalTranscript.toLowerCase())
          } else {
            interimTranscript += transcript
            setState(prev => ({ 
              ...prev, 
              transcript: interimTranscript,
              confidence 
            }))
          }
        }
      }

      recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
        setState(prev => ({ 
          ...prev, 
          isListening: false,
          error: event.error 
        }))
      }

      recognitionRef.current.onend = () => {
        setState(prev => ({ ...prev, isListening: false }))
      }
    }
  }, [])

  // Process voice commands
  const processVoiceCommand = useCallback((transcript: string) => {
    const command = commandsRef.current.find(cmd => 
      transcript.includes(cmd.command.toLowerCase())
    )

    if (command) {
      command.action()
      setState(prev => ({ ...prev, transcript: '' }))
    }
  }, [])

  // Start listening
  const startListening = useCallback(() => {
    if (recognitionRef.current && state.isSupported) {
      try {
        recognitionRef.current.start()
      } catch (error) {
        setState(prev => ({ 
          ...prev, 
          error: 'Failed to start voice recognition' 
        }))
      }
    }
  }, [state.isSupported])

  // Stop listening
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
  }, [])

  // Add voice command
  const addCommand = useCallback((command: VoiceCommand) => {
    commandsRef.current.push(command)
  }, [])

  // Remove voice command
  const removeCommand = useCallback((command: string) => {
    commandsRef.current = commandsRef.current.filter(cmd => cmd.command !== command)
  }, [])

  // Clear transcript
  const clearTranscript = useCallback(() => {
    setState(prev => ({ ...prev, transcript: '' }))
  }, [])

  return {
    ...state,
    startListening,
    stopListening,
    addCommand,
    removeCommand,
    clearTranscript
  }
}

// Predefined voice commands for the app
export const useAppVoiceCommands = () => {
  const { addCommand, removeCommand } = useVoiceNavigation()

  const setupAppCommands = useCallback(() => {
    const commands: VoiceCommand[] = [
      {
        command: 'mở bản đồ',
        action: () => {
          window.location.href = '/map'
        },
        description: 'Mở trang bản đồ'
      },
      {
        command: 'về trang chủ',
        action: () => {
          window.location.href = '/'
        },
        description: 'Về trang chủ'
      },
      {
        command: 'đăng ký leo núi',
        action: () => {
          window.location.href = '/climb'
        },
        description: 'Mở trang đăng ký leo núi'
      },
      {
        command: 'xem cẩm nang',
        action: () => {
          window.location.href = '/guide'
        },
        description: 'Mở trang cẩm nang du lịch'
      },
      {
        command: 'tìm kiếm',
        action: () => {
          // Focus on search input
          const searchInput = document.querySelector('input[type="search"]') as HTMLInputElement
          if (searchInput) {
            searchInput.focus()
          }
        },
        description: 'Mở tìm kiếm'
      },
      {
        command: 'đóng',
        action: () => {
          // Close modal or go back
          const modal = document.querySelector('.modal') as HTMLElement
          if (modal) {
            modal.style.display = 'none'
          } else {
            window.history.back()
          }
        },
        description: 'Đóng modal hoặc quay lại'
      },
      {
        command: 'phóng to',
        action: () => {
          // Zoom in on map
          const map = (window as any).map
          if (map) {
            map.zoomIn()
          }
        },
        description: 'Phóng to bản đồ'
      },
      {
        command: 'thu nhỏ',
        action: () => {
          // Zoom out on map
          const map = (window as any).map
          if (map) {
            map.zoomOut()
          }
        },
        description: 'Thu nhỏ bản đồ'
      },
      {
        command: 'vị trí của tôi',
        action: () => {
          // Get user location
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
              const map = (window as any).map
              if (map) {
                map.setView([position.coords.latitude, position.coords.longitude], 15)
              }
            })
          }
        },
        description: 'Định vị vị trí hiện tại'
      }
    ]

    // Add all commands
    commands.forEach(command => addCommand(command))

    // Return cleanup function
    return () => {
      commands.forEach(command => removeCommand(command.command))
    }
  }, [addCommand, removeCommand])

  return { setupAppCommands }
}

// Voice feedback for accessibility
export const useVoiceFeedback = () => {
  const speak = useCallback((text: string, options?: SpeechSynthesisUtterance) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'vi-VN'
      utterance.rate = 0.9
      utterance.pitch = 1
      utterance.volume = 0.8
      
      if (options) {
        Object.assign(utterance, options)
      }
      
      speechSynthesis.speak(utterance)
    }
  }, [])

  const stopSpeaking = useCallback(() => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel()
    }
  }, [])

  const announcePageTitle = useCallback((title: string) => {
    speak(`Đã chuyển đến ${title}`)
  }, [speak])

  const announceAction = useCallback((action: string) => {
    speak(`Đã ${action}`)
  }, [speak])

  const announceError = useCallback((error: string) => {
    speak(`Lỗi: ${error}`)
  }, [speak])

  return {
    speak,
    stopSpeaking,
    announcePageTitle,
    announceAction,
    announceError
  }
}
