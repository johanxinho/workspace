# Como hacer un commit en git

Un *commit* en Git sirve para guardar los cambios que hiciste en tu proyecto.

## 1. Ir a la carpeta del proyecto

Primero abre la terminal y entra a la carpeta del proyecto:

```bash
cd ruta/de/tu/proyecto

## 2. Revisa el estado

git status

## 3. Añade cambios al área de preparación(staging)

*Para un archivo concreto:*

git add ruta/al/archivo

*Para todos los cambios:*

git add .

## 4. Crea el commit:

git commit -m "Mensaje claro y conciso describiendo el cambio"

## 5. Opcional: enviar los commits al remoto:

git push origin nombre-de-la-rama

*El mensaje commit debe explicar por que cambiate algo*

# Que es push

push es el comando que se usa para enviar tus commits locales a un repositorio remoto

## Ejemplo:

git push origin main

# Que es pull

Un pull en Git es una operación que actualiza tu copia local de un repositorio con los cambios que hay en el remoto.

## Ejemplo:

git pull origin main