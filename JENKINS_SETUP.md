# Tutorial: Configurar Jenkins para ejecutar Tests Playwright

## PASO 1: Descargar e Instalar Jenkins

### Opción A: Instalador de Windows (Recomendado)
1. Ve a https://www.jenkins.io/download/
2. Descarga **Jenkins Windows Installer**
3. Ejecuta el instalador `.msi`
4. Sigue el wizard:
   - **Service Logon Credentials**: Usa cuenta local (SYSTEM)
   - **Port**: Deja el puerto **8080** (default)
   - **Java Path**: Detecta automáticamente

5. Abre navegador: `http://localhost:8080`
6. Copia la contraseña inicial de:
   - Windows: `C:\Program Files\Jenkins\secrets\initialAdminPassword`
7. Completa la instalación inicial

### Opción B: Docker (Si tienes Docker instalado)
```powershell
docker run -d -p 8080:8080 -p 50000:50000 --name jenkins jenkins/jenkins:lts
```
Luego accede a `http://localhost:8080`

---

## PASO 2: Instalar Plugins Necesarios

1. En Jenkins, ve a **Manage Jenkins** (abajo en el menú izquierdo)
2. Click en **Manage Plugins**
3. Ve a la pestaña **Available** (Disponibles)
4. Busca e **instala** estos plugins:

   - **Pipeline** (debe estar visible en la lista)
   - **Git** (para conectar con GitHub/GitLab)
   - **HTML Publisher** (para mostrar reportes de Playwright)
   - **JUnit Plugin** (para resultados de tests) - *puede ya estar instalado*

5. **Marca los checkboxes** al lado de cada plugin
6. Click en **"Install without restart"** (abajo)
7. Espera a que terminen las instalaciones
8. Al final, Jenkins se reiniciará automáticamente

**Espera 1-2 minutos mientras Jenkins reinicia**

---

## PASO 3: Configurar Node.js en Jenkins

1. Ve a **Manage Jenkins**
2. Click en **Tools Configuration** (o **Global Tool Configuration**)
3. Scroll hacia abajo hasta **NodeJS Installations**
4. Click en **Add NodeJS**
5. Completa los campos:
   - **Name**: `Node 18`
   - **Version**: `18.19.0` (o la última)
   - **Global npm packages to install**: (déjalo vacío)
6. Click **Save**

Jenkins descargará Node.js automáticamente en el primer build.

---

## PASO 4: Clonar tu Repositorio en GitHub (si no está)

Si tu proyecto no está en GitHub:

1. Crea repositorio en https://github.com/new
2. En tu carpeta `c:\laragon\www\findu-test`:
   ```powershell
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/tu-usuario/findu-test.git
   git push -u origin main
   ```

3. Crea un **Personal Access Token** en GitHub:
   - Settings → Developer settings → Personal access tokens
   - Scopes: `repo`, `admin:repo_hook`
   - Copia el token (no se muestra de nuevo)

---

## PASO 5: Crear Nueva Job en Jenkins

1. En la página de inicio de Jenkins, click en **New Item** (o **+ New Job**)
2. **Item name**: `findu-login-tests`
3. Selecciona **Pipeline**
4. Click **OK**

---

## PASO 6: Configurar la Pipeline

### Sección "General"
- Deixa como está por defecto

### Sección "Build Triggers" (Cuándo ejecutar)

**Opción A: Ejecutar manualmente (recomendado para empezar)**
- No configures nada, solo haz click en **Build Now**

**Opción B: En cada push a GitHub (Webhook)**
1. Marca: **GitHub hook trigger for GITScm polling**
2. En GitHub: Settings → Webhooks → Add webhook
   - Payload URL: `http://tu-ip-jenkins:8080/github-webhook/`
   - Content type: `application/json`
   - Eventos: Push events
   - Click **Add webhook**

**Opción C: Cada X minutos (Polling)**
1. Marca: **Poll SCM**
2. Schedule: `H/15 * * * *` (cada 15 minutos)

### Sección "Pipeline"
1. **Definition**: Selecciona **Pipeline script from SCM**
2. **SCM**: Selecciona **Git**
3. **Repository URL**: 
   ```
   https://github.com/tu-usuario/findu-test.git
   ```
4. **Branch**: `*/main` (o tu rama)
5. **Script Path**: `Jenkinsfile` (debe estar en la raíz)

6. Click **Save**

---

## PASO 7: Ejecutar el Primer Build

1. En la página del job, click **Build Now**
2. Verás un nuevo build en **Build History** (abajo izquierda)
3. Click en el build `#1` 
4. Click en **Console Output** para ver los logs

**Espera 3-5 minutos** mientras:
- Jenkins descarga Node.js
- Instala dependencias npm
- Instala browsers de Playwright
- Ejecuta los tests

---

## PASO 8: Verificar Resultados

Si el build termina **exitosamente** (verde):

✅ Verás un link **"Playwright Report"** en la página del build
✅ Puedes descargar logs y artefactos

Si **fallan** (rojo):
1. Ve a **Console Output**
2. Busca el error (usualmente al final)
3. Soluciona el problema y vuelve a ejecutar **Build Now**

---

## Troubleshooting

### Error: "Cannot find git command"
```
Manage Jenkins → Tools Configuration → Git Installations
Agrega: C:\Program Files\Git\cmd\git.exe
```

### Error: "npm: command not found"
```
Manage Jenkins → Tools Configuration → NodeJS Installations
Verifica que Node 18 está configurado
```

### Error: "Port 5173 already in use"
```
En Jenkins: Mata procesos Node:
En Jenkinsfile ya está: taskkill /F /IM node.exe /T
```

### Los tests fallan pero funcionan en local
```
Comprueba que tu app escucha en http://localhost:5173
Verifica credenciales de login en el test
```

---

## Archivos que necesitas en tu proyecto

✅ **Jenkinsfile** (para la pipeline)
✅ **playwright.config.ts** (configuración de Playwright)
✅ **tests/login.spec.ts** (tus tests)
✅ **package.json** (con scripts npm)

Todos estos ya existen en tu proyecto.

---

## Resumen de Comandos Rápidos

```powershell
# Verificar que todo funciona en local primero
$env:CI = 'true'
npm run test:e2e

# Limpiar (si algo sale mal)
npm install
npx playwright install
```

---

## Próximos Pasos

Después de que funcione:

1. **Configurar notificaciones por email** (Job → Configurar → Post-build Actions)
2. **Agregar más tests** (crea más archivos .spec.ts)
3. **Integrar con GitHub** (webhooks para auto-ejecutar)
4. **Configurar agentes distribuidos** (ejecutar tests en múltiples máquinas)

