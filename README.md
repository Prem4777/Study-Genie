Study Genie
===========

Study Genie is an AI-powered web application that leverages Large Language Models (LLMs) to help students and professionals convert their learning materials into interactive and digestible formats.

Key Features
------------

*   **Smart Content Processing**: Upload PDFs, images, or enter plain text to generate:  - Summaries    - Flashcards    - Quizzes  
    
*   **AI Chatbot**: Interact with an intelligent assistant for instant Q&A and explanations.  
    
*   **Dashboard & User Profile**:  - Tracks your notes, history, and progress    - Displays interactive graphs for study analytics  
    
*   **Seamless User Experience** with modern web technologies (React & Tailwind).  
    

Project Configuration
---------------------

*   **Frontend:** React.js with Tailwind CSS  
    
*   **Backend & Database:** Supabase  
    
*   **LLM Integration:** Gemini API  
    

### Required Environment Variables

Create a .env.local file in the root directory and add:

Bash

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   GEMINI_API_KEY=your_gemini_api_key_here   `

In your Supabase configuration file (e.g., src/supabase/services.js), add:

JavaScript

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   const SUPABASE_URL = "your_supabase_url";  const SUPABASE_ANON_KEY = "your_supabase_anon_key";  const SUPABASE_API_KEY = "your_supabase_api_key";   `

Run Locally
-----------

### Prerequisites

You must have **Node.js** installed.

1.  Bashgit clone https://github.com/Prem4777/Study-Genie.gitcd Study-Genie
    
2.  **Set environment variables:**Add your API keys as described in the configuration section above.
    
3.  Bashnpm install
    
4.  Bashnpm run dev
    

Contributing
------------

Contributions are welcome!

1.  **Fork** the repository.
    
2.  **Create a new branch** (feature-branch-name).
    
3.  **Commit your changes**.
    
4.  **Push to the branch**.
    
5.  **Open a Pull Request**.
