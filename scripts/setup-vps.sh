#!/bin/bash
# ============================================================
# setup-vps.sh — Installation initiale du Droplet DigitalOcean
# Ubuntu 24.04 — À exécuter UNE SEULE FOIS en root
# ============================================================
set -e

REPO_URL="https://github.com/SayKoder/prodige-studio.git"
APP_DIR="/app/prodige-studio"
DEPLOY_USER="deploy"

echo ""
echo "╔══════════════════════════════════════════════════╗"
echo "║         PRODIGE STUDIO — Setup VPS               ║"
echo "╚══════════════════════════════════════════════════╝"
echo ""

# ─── 1. Mise à jour système ────────────────────────────────
echo "→ [1/8] Mise à jour du système..."
apt-get update -qq && apt-get upgrade -y -qq
apt-get install -y -qq curl git ufw

# ─── 2. Docker ────────────────────────────────────────────
echo "→ [2/8] Installation de Docker..."
if ! command -v docker &> /dev/null; then
  curl -fsSL https://get.docker.com | sh
fi
# Plugin Compose v2
apt-get install -y -qq docker-compose-plugin
echo "   Docker version : $(docker --version)"

# ─── 3. Utilisateur deploy ────────────────────────────────
echo "→ [3/8] Création de l'utilisateur 'deploy'..."
if ! id -u $DEPLOY_USER &> /dev/null; then
  useradd -m -s /bin/bash $DEPLOY_USER
fi
usermod -aG docker $DEPLOY_USER

# ─── 4. Clé SSH pour GitHub Actions ──────────────────────
echo "→ [4/8] Génération de la clé SSH deploy..."
SSH_DIR="/home/$DEPLOY_USER/.ssh"
mkdir -p "$SSH_DIR"
if [ ! -f "$SSH_DIR/id_ed25519" ]; then
  ssh-keygen -t ed25519 -C "deploy@prodige-studio" -f "$SSH_DIR/id_ed25519" -N ""
fi
cat "$SSH_DIR/id_ed25519.pub" >> "$SSH_DIR/authorized_keys"
chmod 700 "$SSH_DIR"
chmod 600 "$SSH_DIR/authorized_keys"
chown -R $DEPLOY_USER:$DEPLOY_USER "$SSH_DIR"

echo ""
echo "┌─────────────────────────────────────────────────────┐"
echo "│  CLÉ PRIVÉE — Copier dans GitHub → Settings →      │"
echo "│  Secrets → VPS_SSH_KEY                             │"
echo "└─────────────────────────────────────────────────────┘"
cat "$SSH_DIR/id_ed25519"
echo ""
read -p "Appuyez sur Entrée quand la clé est copiée dans GitHub..."

# ─── 5. Réseau Docker externe ─────────────────────────────
echo "→ [5/8] Création du réseau Docker 'web'..."
docker network create web 2>/dev/null || echo "   Réseau 'web' déjà existant"

# ─── 6. Clone du repo ─────────────────────────────────────
echo "→ [6/8] Clone du dépôt GitHub..."
mkdir -p "$(dirname $APP_DIR)"
if [ ! -d "$APP_DIR/.git" ]; then
  git clone "$REPO_URL" "$APP_DIR"
else
  echo "   Repo déjà cloné — git pull..."
  cd "$APP_DIR" && git pull origin main
fi
chown -R $DEPLOY_USER:$DEPLOY_USER "$APP_DIR"

# ─── 7. Fichier .env de production ───────────────────────
echo "→ [7/8] Création du fichier .env de production..."
ENV_FILE="$APP_DIR/.env"

if [ ! -f "$ENV_FILE" ]; then
  NEXTAUTH_SECRET=$(openssl rand -base64 32)
  POSTGRES_PASSWORD=$(openssl rand -base64 24 | tr -d '=+/' | cut -c1-20)

  cat > "$ENV_FILE" <<EOF
# ─── PostgreSQL ───────────────────────────────────────────
DATABASE_URL="postgresql://prodige:${POSTGRES_PASSWORD}@postgres:5432/prodige"
POSTGRES_DB=prodige
POSTGRES_USER=prodige
POSTGRES_PASSWORD=${POSTGRES_PASSWORD}

# ─── NextAuth ─────────────────────────────────────────────
NEXTAUTH_SECRET="${NEXTAUTH_SECRET}"
NEXTAUTH_URL="https://prodige-studio.me"

# ─── Admin ────────────────────────────────────────────────
ADMIN_EMAIL="admin@prodige-studio.me"
ADMIN_PASSWORD="Prodige@Studio24!"
EOF

  chmod 600 "$ENV_FILE"
  chown $DEPLOY_USER:$DEPLOY_USER "$ENV_FILE"

  echo ""
  echo "┌─────────────────────────────────────────────────────┐"
  echo "│  IMPORTANT — Modifiez ces valeurs dans .env :      │"
  echo "│    ADMIN_EMAIL    → votre vrai email               │"
  echo "│    ADMIN_PASSWORD → mot de passe fort              │"
  echo "│  Fichier : $ENV_FILE"
  echo "└─────────────────────────────────────────────────────┘"
  echo ""
  read -p "Éditez le .env maintenant ? [o/N] " edit_env
  if [[ "$edit_env" =~ ^[oO]$ ]]; then
    nano "$ENV_FILE"
  fi
else
  echo "   .env déjà existant — ignoré"
fi

# ─── 8. Firewall UFW ──────────────────────────────────────
echo "→ [8/8] Configuration du firewall..."
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw --force enable
echo "   Firewall actif (22, 80, 443)"

# ─── Premier lancement ────────────────────────────────────
echo ""
echo "→ Premier lancement des conteneurs..."
cd "$APP_DIR"
sudo -u $DEPLOY_USER docker compose up -d --build

echo ""
echo "╔══════════════════════════════════════════════════╗"
echo "║              SETUP TERMINÉ ✓                     ║"
echo "╠══════════════════════════════════════════════════╣"
echo "║  Site      : https://prodige-studio.me          ║"
echo "║  Admin     : https://prodige-studio.me/studio-access ║"
echo "║  App dir   : $APP_DIR                  ║"
echo "╠══════════════════════════════════════════════════╣"
echo "║  PROCHAINES ÉTAPES :                             ║"
echo "║  1. Pointer DNS prodige-studio.me → $(curl -s ifconfig.me) ║"
echo "║  2. Ajouter VPS_HOST, VPS_USER, VPS_SSH_KEY     ║"
echo "║     dans GitHub → Settings → Secrets            ║"
echo "║  3. Lancer le seed : docker compose exec nextjs ║"
echo "║     node node_modules/prisma/build/index.js db seed ║"
echo "╚══════════════════════════════════════════════════╝"
echo ""
