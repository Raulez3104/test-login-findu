pipeline {
    agent any

    environment {
        CI = 'true'
        NODE_ENV = 'test'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                bat 'npm install'
                bat 'npx playwright install'
            }
        }

        stage('Start Application') {
            steps {
                bat 'START /B npm run dev > app.log 2>&1'
                bat 'timeout /t 10 /nobreak'
                bat 'curl -f http://localhost:5173 || exit /b 1'
            }
        }

        stage('Run Tests') {
            steps {
                bat 'npm run test:e2e'
            }
        }
    }

    post {
        always {
            // Publicar reportes de Playwright
            publishHTML([
                reportDir: 'playwright-report',
                reportFiles: 'index.html',
                reportName: 'Playwright Report',
                keepAll: true
            ])

            // Publicar resultados JUnit
            junit testResults: 'test-results/junit.xml', allowEmptyResults: true

            // Guardar artefactos
            archiveArtifacts artifacts: 'test-results/**', allowEmptyArchive: true
            archiveArtifacts artifacts: 'app.log', allowEmptyArchive: true
            archiveArtifacts artifacts: 'playwright-report/**', allowEmptyArchive: true

            // Limpiar procesos Node
            bat 'taskkill /F /IM node.exe /T || exit /b 0'
        }
        
        success {
            echo '✅ Tests pasaron exitosamente'
        }
        
        failure {
            echo '❌ Tests fallaron'
        }
    }
}
