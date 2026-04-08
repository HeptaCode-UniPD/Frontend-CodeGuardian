$BUCKET_NAME = "frontend-codeguardian"
$IMAGE_NAME = "frontend-builder-temp"
$CONTAINER_NAME = "extract-container"

Write-Host "Aggiornamento codice..."
git pull

Write-Host "Building Docker..."
docker build -t $IMAGE_NAME .

Write-Host "Estrazione file..."
Remove-Item -Recurse -Force ./dist -ErrorAction SilentlyContinue
docker create --name $CONTAINER_NAME $IMAGE_NAME
docker cp "${CONTAINER_NAME}:/usr/share/nginx/html" ./dist
docker rm $CONTAINER_NAME

Write-Host "Sync su S3..."
aws s3 sync ./dist s3://$BUCKET_NAME --delete

Write-Host "Deploy completato!"