import { useState, useEffect } from "react";
import { Editor } from "@monaco-editor/react";
import { PlayIcon, DownloadIcon, CopyIcon, RotateCcwIcon } from "lucide-react";
import toast from "react-hot-toast";
import ErrorBoundary from '../components/ErrorBoundary';

const LANGUAGES = [
  {
    id: "javascript",
    name: "JavaScript",
    icon: "/javascript.png",
    monacoLanguage: "javascript",
    defaultCode: `// JavaScript Example
const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(n => n * 2);
console.log(doubled);

function greet(name) {
  return \`Hello, \${name}!\`;
}

console.log(greet("World"));`,
    pistonRuntime: "javascript",
    pistonVersion: "*"
  },
  {
    id: "python",
    name: "Python",
    icon: "/python.png",
    monacoLanguage: "python",
    defaultCode: `# Python Example
numbers = [1, 2, 3, 4, 5]
doubled = [n * 2 for n in numbers]
print(doubled)

def greet(name):
    return f"Hello, {name}!"

print(greet("World"))`,
    pistonRuntime: "python",
    pistonVersion: "*"
  },
  {
    id: "java",
    name: "Java",
    icon: "/java.png",
    monacoLanguage: "java",
    defaultCode: `// Java Example
import java.util.Arrays;
import java.util.stream.Collectors;

public class Main {
    public static void main(String[] args) {
        int[] numbers = {1, 2, 3, 4, 5};
        int[] doubled = Arrays.stream(numbers)
                             .map(n -> n * 2)
                             .toArray();
        System.out.println(Arrays.toString(doubled));
        
        System.out.println(greet("World"));
    }
    
    public static String greet(String name) {
        return "Hello, " + name + "!";
    }
}`,
    pistonRuntime: "java",
    pistonVersion: "*"
  },
  {
    id: "cpp",
    name: "C++",
    icon: "/cpp.png",
    monacoLanguage: "cpp",
    defaultCode: `// C++ Example
#include <iostream>
#include <vector>
#include <algorithm>
#include <string>

std::string greet(const std::string& name) {
    return "Hello, " + name + "!";
}

int main() {
    std::vector<int> numbers = {1, 2, 3, 4, 5};
    std::vector<int> doubled;
    
    std::transform(numbers.begin(), numbers.end(), 
                   std::back_inserter(doubled), 
                   [](int n) { return n * 2; });
    
    for (int n : doubled) {
        std::cout << n << " ";
    }
    std::cout << std::endl;
    
    std::cout << greet("World") << std::endl;
    
    return 0;
}`,
    pistonRuntime: "c++", // Changed from "cpp"
    pistonVersion: "*"
  },
  {
    id: "csharp",
    name: "C#",
    icon: "/csharp.png",
    monacoLanguage: "csharp",
    defaultCode: `// C# Example
using System;
using System.Linq;

class Program
{
    static void Main()
    {
        int[] numbers = {1, 2, 3, 4, 5};
        var doubled = numbers.Select(n => n * 2).ToArray();
        
        Console.WriteLine(string.Join(", ", doubled));
        Console.WriteLine(Greet("World"));
    }
    
    static string Greet(string name)
    {
        return $"Hello, {name}!";
    }
}`,
    pistonRuntime: "csharp", // Keep as "csharp"
    pistonVersion: "*"
  },
  {
    id: "go",
    name: "Go",
    icon: "/go.png",
    monacoLanguage: "go",
    defaultCode: `// Go Example
package main

import (
    "fmt"
)

func greet(name string) string {
    return fmt.Sprintf("Hello, %s!", name)
}

func main() {
    numbers := []int{1, 2, 3, 4, 5}
    var doubled []int
    
    for _, n := range numbers {
        doubled = append(doubled, n*2)
    }
    
    fmt.Println(doubled)
    fmt.Println(greet("World"))
}`,
    pistonRuntime: "go",
    pistonVersion: "*"
  },
  {
    id: "rust",
    name: "Rust",
    icon: "/rust.png",
    monacoLanguage: "rust",
    defaultCode: `// Rust Example
fn greet(name: &str) -> String {
    format!("Hello, {}!", name)
}

fn main() {
    let numbers = vec![1, 2, 3, 4, 5];
    let doubled: Vec<i32> = numbers.iter().map(|&n| n * 2).collect();
    
    println!("{:?}", doubled);
    println!("{}", greet("World"));
}`,
    pistonRuntime: "rust",
    pistonVersion: "*"
  },
//   {
//     id: "php",
//     name: "PHP",
//     icon: "/php.jng", // Sử dụng js.png cho PHP vì không có php.png
//     monacoLanguage: "php",
//     defaultCode: `<?php
// // PHP Example
// function greet($name) {
//     return "Hello, $name!";
// }

// $numbers = [1, 2, 3, 4, 5];
// $doubled = array_map(function($n) { return $n * 2; }, $numbers);

// print_r($doubled);
// echo greet("World") . "\n";
// ?>`,
//     pistonRuntime: "php",
//     pistonVersion: "*"
//   },
{
    id: "bash",
    name: "Shell/Bash",
    icon: "/bash.png",
    monacoLanguage: "shell",
    defaultCode: `#!/bin/bash
# Shell/Bash Example

# Array of numbers
numbers=(1 2 3 4 5)
doubled=()

# Function to greet
greet() {
    echo "Hello, $1!"
}

# Double each number
for num in "\${numbers[@]}"; do
    doubled+=($(($num * 2)))
done

# Print results
echo "Original: \${numbers[@]}"
echo "Doubled: \${doubled[@]}"
greet "World"`,
    pistonRuntime: "bash",
    pistonVersion: "*"
  },
  {
    id: "ruby",
    name: "Ruby",
    icon: "/ruby.png",
    monacoLanguage: "ruby",
    defaultCode: `# Ruby Example
def greet(name)
  "Hello, #{name}!"
end

numbers = [1, 2, 3, 4, 5]
doubled = numbers.map { |n| n * 2 }

puts doubled.inspect
puts greet("World")`,
    pistonRuntime: "ruby",
    pistonVersion: "*"
  },

  {
    id: "typescript",
    name: "TypeScript",
    icon: "/typescript.png",
    monacoLanguage: "typescript",
    defaultCode: `// TypeScript Example
const numbers: number[] = [1, 2, 3, 4, 5];
const doubled: number[] = numbers.map((n: number) => n * 2);
console.log(doubled);

function greet(name: string): string {
  return \`Hello, \${name}!\`;
}

console.log(greet("World"));`,
    pistonRuntime: "typescript",
    pistonVersion: "*"
  },

  
];

const CodePlaygroundPage = () => {
  const [selectedLanguage, setSelectedLanguage] = useState(LANGUAGES[1]); // Changed from LANGUAGES[0] to LANGUAGES[1] for Python
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [fontSize, setFontSize] = useState(18); // Changed from 14 to 18
  const [editorLoaded, setEditorLoaded] = useState(false);
  const [editorError, setEditorError] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Load saved code from localStorage
  useEffect(() => {
    const savedCode = localStorage.getItem(`code-playground-${selectedLanguage.id}`);
    if (savedCode) {
      setCode(savedCode);
    } else {
      setCode(selectedLanguage.defaultCode);
    }
  }, [selectedLanguage]);

  // Save code to localStorage
  useEffect(() => {
    if (code) {
      localStorage.setItem(`code-playground-${selectedLanguage.id}`, code);
    }
  }, [code, selectedLanguage.id]);

  const handleLanguageChange = (language) => {
    setSelectedLanguage(language);
    setOutput("");
  };

  const getFileName = () => {
    if (!selectedLanguage) return 'file.txt'; // Fallback if selectedLanguage is undefined
    const extensions = {
      javascript: 'js',
      python: 'py',
      java: 'java',
      cpp: 'cpp',
      csharp: 'cs',
      go: 'go',
      rust: 'rs',
      php: 'php',
      ruby: 'rb',
      swift: 'swift'
    };
    return `main.${extensions[selectedLanguage.id] || 'txt'}`;
  };

  const tryAlternativeExecution = async () => {
    // This is a placeholder for a fallback execution method.
    // You might want to implement another API call here if Piston fails.
    setOutput("Piston API failed. No alternative execution method is currently configured.");
    toast.error("Alternative execution not available.");
  };

  const runCode = async () => {
    if (!code.trim()) {
      toast.error("Please write some code first!");
      return;
    }

    setIsRunning(true);
    setOutput("Running...");

    try {
      // Sử dụng API Piston với cấu trúc đúng
      const response = await fetch("https://emkc.org/api/v2/piston/execute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        mode: "cors",
        body: JSON.stringify({
          language: selectedLanguage.pistonRuntime,
          version: selectedLanguage.pistonVersion || "*", // Thêm version bắt buộc
          files: [
            {
              name: getFileName(),
              content: code,
            },
          ],
          stdin: "",
          args: [],
          compile_timeout: 10000,
          run_timeout: 3000,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const result = await response.json();
      
      if (result.run) {
        let output = "";
        if (result.run.stdout) {
          output += result.run.stdout;
        }
        if (result.run.stderr) {
          output += result.run.stderr;
        }
        
        setOutput(output || "No output");
        
        if (result.run.stderr) {
          toast.error("Code executed with errors");
        } else {
          toast.success("Code executed successfully!");
        }
      } else {
        setOutput("Error: Unable to execute code");
        toast.error("Execution failed");
      }
    } catch (error) {
      console.error("Execution error:", error);
      setOutput(`Error: ${error.message}`);
      toast.error("Failed to execute code");
      
      // Không gọi tryAlternativeExecution nữa vì nó chỉ hiển thị thông báo lỗi
    } finally {
      setIsRunning(false);
    }
  };

  const copyCode = async () => {
    navigator.clipboard.writeText(code);
    toast.success("Code copied to clipboard!");
  };

  const downloadCode = () => {
    const element = document.createElement("a");
    const file = new Blob([code], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `code.${selectedLanguage.id === 'cpp' ? 'cpp' : selectedLanguage.id === 'csharp' ? 'cs' : selectedLanguage.id}`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success("Code downloaded!");
  };

  const resetCode = () => {
    setCode(selectedLanguage.defaultCode);
    setOutput("");
    localStorage.removeItem(`code-playground-${selectedLanguage.id}`);
    toast.success("Code reset to default!");
  };

  return (
    <div className="h-screen flex flex-col bg-base-100">
      {/* Controls - Removed ugly header */}
      <div className="bg-base-200 border-b border-base-300 p-4">
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {/* Language Selector with Icons */}
          <div className="dropdown w-full sm:w-auto">
            <div 
              tabIndex={0} 
              role="button" 
              className="btn btn-outline w-full sm:w-auto justify-start"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <img 
                src={selectedLanguage.icon} 
                alt={selectedLanguage.name}
                className="w-5 h-5 mr-2"
              />
              {selectedLanguage.name}
              <svg className="ml-auto w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            {isDropdownOpen && (
              <ul 
                tabIndex={0} 
                className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow border border-base-300 mt-1"
              >
                {LANGUAGES.map((lang) => (
                  <li key={lang.id}>
                    <a 
                      className={`flex items-center gap-3 ${selectedLanguage.id === lang.id ? 'active' : ''}`}
                      onClick={() => {
                        handleLanguageChange(lang);
                        setIsDropdownOpen(false);
                      }}
                    >
                      <img 
                        src={lang.icon} 
                        alt={lang.name}
                        className="w-5 h-5"
                      />
                      {lang.name}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Font Size */}
          <select 
            className="select select-bordered w-full sm:w-auto"
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
          >
            <option value={12}>12px</option>
            <option value={14}>14px</option>
            <option value={16}>16px</option>
            <option value={18}>18px</option>
            <option value={20}>20px</option>
          </select>

          {/* Action Buttons - Made bigger */}
          <div className="flex gap-3">
            <button 
              className="btn btn-primary"
              onClick={runCode}
              disabled={isRunning}
            >
              <PlayIcon className="size-5" />
              {isRunning ? "Running..." : "Run"}
            </button>
            
            <button 
              className="btn btn-ghost"
              onClick={copyCode}
            >
              <CopyIcon className="size-5" />
            </button>
            
            <button 
              className="btn btn-ghost"
              onClick={downloadCode}
            >
              <DownloadIcon className="size-5" />
            </button>
            
            <button 
              className="btn btn-ghost"
              onClick={resetCode}
            >
              <RotateCcwIcon className="size-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Editor and Output */}
      <div className="flex-1 flex flex-col lg:flex-row gap-2 max-h-[600px]">
        {/* Code Editor */}
        <div className="flex-1 border border-base-300 rounded-lg overflow-hidden h-[600px]">
          <div className="h-full">
            {editorError ? (
              <div className="h-full flex items-center justify-center bg-base-200">
                <div className="text-center">
                  <p className="mb-4">Editor failed to load</p>
                  <textarea 
                    className="textarea textarea-bordered w-full h-96"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Fallback text editor..."
                  />
                </div>
              </div>
            ) : (
              <ErrorBoundary>
                <Editor
                  height="600px"
                  language={selectedLanguage.monacoLanguage}
                  value={code}
                  onChange={(value) => setCode(value || "")}
                  theme="vs-dark"
                  options={{
                    fontSize: fontSize,
                    minimap: { enabled: window.innerWidth > 768 },
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    wordWrap: "on",
                    lineNumbers: "on",
                    glyphMargin: false,
                    folding: true,
                    readOnly: false,
                    cursorStyle: "line",
                    formatOnType: false, 
                    formatOnPaste: false, 
                    quickSuggestions: false, 
                    parameterHints: { enabled: false },
                    hover: { enabled: false },
                    contextmenu: false,
                    mouseWheelZoom: true,
                  }}
                  onMount={(editor, monaco) => {
                    console.log('Monaco Editor mounted successfully');
                    setEditorLoaded(true);
                  }}
                  onValidate={(markers) => {
                    if (markers.length > 0) {
                      console.log('Editor validation markers:', markers);
                    }
                  }}
                  onError={() => setEditorError(true)}
                />
              </ErrorBoundary>
            )}
          </div>
        </div>

        {/* Output Panel - Enhanced */}
        <div className="flex-1 bg-base-200 flex flex-col border border-base-300 rounded-lg overflow-hidden h-[600px]">
          {/* Output Header */}
          <div className="p-4 border-b border-base-300 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <h3 className="font-semibold text-lg ml-2">Output</h3>
            </div>
            <div className="flex gap-2">
              <button 
                className="btn btn-ghost btn-sm"
                onClick={() => {
                  navigator.clipboard.writeText(output);
                  toast.success("Output copied!");
                }}
                disabled={!output || output === "Run your code to see output here..."}
              >
                <CopyIcon className="size-4" />
              </button>
              <button 
                className="btn btn-ghost btn-sm"
                onClick={() => setOutput("")}
                disabled={!output || output === "Run your code to see output here..."}
              >
                <RotateCcwIcon className="size-4" />
              </button>
            </div>
          </div>
          
          {/* Output Content */}
          <div className="flex-1 relative">
            {isRunning ? (
              <div className="flex items-center justify-center h-full">
                <div className="flex flex-col items-center gap-3">
                  <div className="loading loading-spinner loading-md"></div>
                  <span className="text-sm text-base-content/70">Running code...</span>
                </div>
              </div>
            ) : (
              <div className="h-full overflow-auto">
                {output && output !== "Run your code to see output here..." ? (
                  <div className="p-4">
                    <div className="bg-base-300 rounded-lg p-4 border border-base-content/10">
                      <pre className="text-sm font-mono whitespace-pre-wrap break-words leading-relaxed text-base-content">
                        {output}
                      </pre>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center text-base-content/50">
                      <div className="text-4xl mb-2">⚡</div>
                      <p className="text-sm">Run your code to see output here...</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Output Footer */}
          <div className="p-3 border-t border-base-300 bg-base-100">
            <div className="flex items-center justify-between text-xs text-base-content/60">
              <span>Language: {selectedLanguage.name}</span>
              {output && output !== "Run your code to see output here..." && (
                <span>{output.split('\n').length} lines</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodePlaygroundPage;

const tryAlternativeExecution = async () => {
  try {
    // Fallback execution logic
    setOutput("Alternative execution not available. Please check your code syntax.");
  } catch (error) {
    setOutput(`Execution failed: ${error.message}`);
  }
};
