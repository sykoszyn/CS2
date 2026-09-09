# Publicar SmokeAR en Play Store y App Store

SmokeAR es una app web dinámica (Next.js con Server Actions, sesiones, RLS
por usuario) — no un sitio estático — así que en ambas tiendas se publica
como un **wrapper nativo delgado que carga el sitio real**, no como una
reescritura nativa. Esta guía documenta exactamente qué ya está listo en
este repo y qué pasos le quedan a quien tenga las cuentas de desarrollador
(no se pueden hacer desde este entorno: requieren una cuenta de Google
Play/Apple Developer real, pago, firma de código, y para iOS una Mac con
Xcode).

## Lo que ya está en el repo

- **Manifest completo** (`src/app/manifest.ts`): nombre, colores, `display:
  standalone`, atajos, e íconos en todos los tamaños que piden ambas
  tiendas.
- **Screenshots reales** de la app en `public/screenshots/` (`mobile-home`,
  `mobile-lineups`, `desktop-home`), ya referenciados en el manifest para
  la "instalación enriquecida" de Android/Chrome, y listos para subir tal
  cual a la ficha de Play Store / App Store.
- **Assets de tienda** en `store-assets/` (no se sirven en el sitio, son
  para subir directo a las consolas):
  - `play-feature-graphic-1024x500.png` — el banner que pide Play Console.
  - `ios-icon-1024.png` — ícono de App Store (1024×1024, sin transparencia,
    sin esquinas redondeadas — Apple aplica su propia máscara).
- **`public/.well-known/assetlinks.json`** — el archivo de Digital Asset
  Links que Android necesita para verificar la TWA (ver abajo). Tiene
  valores de relleno (`REPLACE_WITH_...`) que hay que completar con datos
  reales una vez generada la firma de la app.
- **Política de privacidad** (`/privacy`) y **Términos de uso** (`/terms`),
  linkeados desde el footer — ambas tiendas exigen una URL de privacidad
  para publicar. Son un borrador razonable, no un documento legal
  revisado: reemplazá el email de contacto de `/privacy` por uno real antes
  de enviar la app a review.
- **Eliminar cuenta** (`/settings`): Apple exige que cualquier app con
  registro permita borrar la cuenta desde adentro de la app; Google Play
  lo pide en el formulario de Data Safety. Ya está implementado y
  verificado — borra la cuenta de Supabase Auth, lo que en cascada borra
  los datos privados (likes, favoritos, comentarios, calificaciones) y
  deja el contenido publicado (lineups, boosts, jugadas) sin autor, igual
  que cualquier otro caso de "el autor ya no está".

## Android — Google Play, vía TWA (Trusted Web Activity)

Una TWA es un Chrome sin barra de direcciones que muestra el sitio real —
es la forma soportada oficialmente por Google de publicar una PWA en Play
Store. La herramienta es [Bubblewrap](https://github.com/GoogleChromeLabs/bubblewrap).

1. **Cuenta de Google Play Console** (fuera de este repo): $25 único pago,
   verificación de identidad.
2. **Generar el proyecto Android** (necesita Node y un JDK; Bubblewrap
   puede instalar su propio Android SDK/JDK si no tenés uno):
   ```bash
   npm install -g @bubblewrap/cli
   bubblewrap init --manifest=https://smokear.vercel.app/manifest.webmanifest
   ```
   Te va a preguntar el `packageId` (sugiere algo como `app.vercel.smokear.twa`
   a partir del dominio — está bien, o elegí tu propio dominio reverso si
   tenés uno) y te genera (o usa) una keystore para firmar.
3. **Compilar**: `bubblewrap build` produce un `.aab` firmado y también
   imprime el **SHA-256 fingerprint** de tu certificado de firma.
4. **Completar `assetlinks.json`**: reemplazá los dos placeholders en
   `public/.well-known/assetlinks.json` con tu `packageId` real y el
   fingerprint del paso anterior, commiteá y esperá a que Vercel
   redespliegue. Sin este archivo, la TWA muestra la barra de URL en vez
   de pantalla completa (no queda "verificada").
5. **Verificar**: `https://smokear.vercel.app/.well-known/assetlinks.json`
   tiene que devolver el JSON con tus valores reales (podés confirmarlo con
   la [Statement List Tool](https://developers.google.com/digital-asset-links/tools/generator)
   de Google).
6. **Play Console**: crear la app, subir el `.aab`, completar la ficha con
   `store-assets/play-feature-graphic-1024x500.png`,
   `public/icons/maskable-512.png` como ícono (es la variante de fondo
   completo sin esquinas redondeadas — Play aplica su propia máscara, igual
   que Apple) y las capturas de `public/screenshots/`. Categoría sugerida:
   Deportes o Herramientas. Cargar la URL de `/privacy` donde pide política
   de privacidad, y completar el formulario de Data Safety mencionando que
   se recolecta email/perfil para autenticación y que el usuario puede
   borrar su cuenta desde `/settings`.
7. Enviar a revisión.

## iOS — App Store, vía Capacitor

Apple no tiene un equivalente directo a las TWA; el camino estándar para
una PWA dinámica es envolverla con [Capacitor](https://capacitorjs.com/)
apuntando a la URL de producción (no a un build estático — esta app usa
Server Actions y SSR, así que no aplica `next export`). Esto **requiere
una Mac con Xcode** y una cuenta de **Apple Developer Program** (USD 99/año)
— ninguno de los dos existe en este entorno.

1. En tu Mac, dentro de una copia del repo:
   ```bash
   npm install @capacitor/core @capacitor/cli @capacitor/ios
   npx cap init SmokeAR ar.smokear.app --web-dir=public
   ```
2. En `capacitor.config.ts`, configurá el wrapper para que cargue el sitio
   en vivo en vez de archivos locales:
   ```ts
   const config: CapacitorConfig = {
     appId: "ar.smokear.app",
     appName: "SmokeAR",
     webDir: "public",
     server: { url: "https://smokear.vercel.app", cleartext: false },
   };
   ```
3. `npx cap add ios` genera el proyecto Xcode.
4. En Xcode: asset catalog con `store-assets/ios-icon-1024.png` para el
   ícono de App Store (Xcode genera el resto de los tamaños de sistema a
   partir de ese), configurar el equipo de firma (tu Apple Developer
   Program), y en App Store Connect crear el registro de la app.
5. Completar la ficha en App Store Connect: `store-assets/ios-icon-1024.png`
   como ícono, las capturas de `public/screenshots/mobile-*.png` (necesitás
   además una captura en el tamaño de pantalla de tu dispositivo de prueba
   — el que exige App Store Connect en el momento de subir), y la URL de
   `/privacy` en el campo obligatorio de política de privacidad. También
   hay que responder el cuestionario de privacidad ("App Privacy") con la
   misma información que ya está en `/privacy`.
6. Compilar/archivar desde Xcode y subir con Xcode Organizer o Transporter.
7. Enviar a revisión.

## Lo que no se puede hacer desde este entorno

- Crear las cuentas de Google Play Console o Apple Developer Program (piden
  pago e identidad real).
- Compilar el `.aab` de Android (necesita Android SDK/JDK) o el `.ipa` de
  iOS (necesita Xcode en macOS) — ambos se corren en tu máquina siguiendo
  los pasos de arriba.
- Firmar y subir los binarios a cada consola.

Todo lo demás — manifest, íconos, capturas, banner, política de privacidad,
términos, y la función de borrar cuenta que ambas tiendas exigen — ya está
en el repo y funcionando en producción.
