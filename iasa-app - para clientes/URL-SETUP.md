# Configuración de URLs Limpias para iasaapp.online

Este proyecto ha sido reorganizado para usar URLs limpias sin extensión `.html`.

## Estructura de Archivos

Todas las páginas principales ahora están organizadas en carpetas:

```
/homenoticias/index.html → accesible en iasaapp.online/homenoticias
/comunidad/index.html → accesible en iasaapp.online/comunidad
/mercado/index.html → accesible en iasaapp.online/mercado
/activities/index.html → accesible en iasaapp.online/activities
/contacto/index.html → accesible en iasaapp.online/contacto
/pedidos/index.html → accesible en iasaapp.online/pedidos
/perfil/index.html → accesible en iasaapp.online/perfil
/qr/index.html → accesible en iasaapp.online/qr
/registro/index.html → accesible en iasaapp.online/registro
/soporte/index.html → accesible en iasaapp.online/soporte
/visitas/index.html → accesible en iasaapp.online/visitas
/onboarding/index.html → accesible en iasaapp.online/onboarding
/privacy-policy/index.html → accesible en iasaapp.online/privacy-policy
```

## Configuración del Servidor

### Opción 1: Vercel (Recomendado)

El archivo `vercel.json` ya está configurado. Simplemente despliega el proyecto en Vercel:

```bash
npm install -g vercel
vercel --prod
```

### Opción 2: Apache

El archivo `.htaccess` ya está incluido en la raíz del proyecto. Solo asegúrate de que tu servidor Apache tenga habilitado `mod_rewrite`:

```bash
sudo a2enmod rewrite
sudo systemctl restart apache2
```

### Opción 3: Nginx

Usa la configuración en `nginx.conf.example`:

```bash
# Copia el archivo de configuración
sudo cp nginx.conf.example /etc/nginx/sites-available/iasaapp.online

# Crea un enlace simbólico
sudo ln -s /etc/nginx/sites-available/iasaapp.online /etc/nginx/sites-enabled/

# Prueba la configuración
sudo nginx -t

# Reinicia Nginx
sudo systemctl restart nginx
```

### Opción 4: Servidor Node.js Local

Si estás usando el `server.js` incluido, ya está configurado para manejar las URLs limpias:

```bash
npm install
node server.js
```

## SSL/HTTPS

Para configurar HTTPS con Let's Encrypt:

```bash
# Instalar certbot
sudo apt install certbot python3-certbot-nginx  # Para Nginx
# o
sudo apt install certbot python3-certbot-apache  # Para Apache

# Obtener certificado
sudo certbot --nginx -d iasaapp.online -d www.iasaapp.online
# o
sudo certbot --apache -d iasaapp.online -d www.iasaapp.online
```

## DNS

Configura los siguientes registros DNS en tu proveedor:

```
Tipo  Nombre  Valor              TTL
A     @       <IP_DE_TU_SERVIDOR> 3600
A     www     <IP_DE_TU_SERVIDOR> 3600
```

O si usas Vercel:

```
Tipo   Nombre  Valor           TTL
CNAME  @       cname.vercel-dns.com  3600
CNAME  www     cname.vercel-dns.com  3600
```

## Pruebas Locales

Para probar localmente con URLs limpias:

```bash
# Opción 1: Usar el servidor Node.js incluido
node server.js

# Opción 2: Usar un servidor HTTP simple de Python
python -m http.server 8000

# Opción 3: Usar live-server de npm (recomendado para desarrollo)
npm install -g live-server
live-server --port=8000 --entry-file=index.html
```

## Notas Importantes

1. **Archivos antiguos**: Los archivos `.html` en la raíz (como `homenoticias.html`, `comunidad.html`, etc.) pueden eliminarse después de verificar que todo funciona correctamente.

2. **Service Worker**: Si usas un service worker (`sw.js`), asegúrate de actualizarlo para que cachee las nuevas rutas.

3. **Enlaces externos**: Todos los enlaces en la aplicación ya han sido actualizados para usar rutas limpias (`/homenoticias` en lugar de `homenoticias.html`).

4. **Recursos estáticos**: Todos los recursos (CSS, JS, imágenes) usan rutas absolutas desde la raíz (`/styles.css`, `/logo1.png`, etc.).

## Verificación

Después de desplegar, verifica que las siguientes URLs funcionan:

- https://iasaapp.online
- https://iasaapp.online/homenoticias
- https://iasaapp.online/comunidad
- https://iasaapp.online/mercado
- https://iasaapp.online/perfil

## Soporte

Si tienes problemas, revisa:

1. Los logs del servidor web
2. La consola del navegador para errores de JavaScript
3. Que todos los archivos estén en las carpetas correctas
4. Que las rutas de recursos sean absolutas (empiecen con `/`)
