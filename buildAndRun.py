import os
import subprocess
import shutil

# Set paths
frontend_dir = "./familyTreeUI"
dist_dir = os.path.join(frontend_dir, "dist")

def run_command(cmd, cwd=None):
    print(f"\n▶ Running: {' '.join(cmd)}")
    subprocess.run(cmd, cwd=cwd, check=True)

def clean_old_build():
    if os.path.exists(dist_dir):
        print("🧹 Removing old build...")
        shutil.rmtree(dist_dir)
    else:
        print("ℹ️ No previous build found.")

def build_frontend():
    print("🛠️ Building frontend...")
    run_command(["npm", "install"], cwd=frontend_dir)
    run_command(["npm", "run", "build"], cwd=frontend_dir)

def restart_containers():
    print("📦 Restarting containers...")
    run_command(["podman-compose", "down"])
    run_command(["podman-compose", "up", "--build", "-d"])

def main():
    clean_old_build()
    build_frontend()
    restart_containers()
    print("\n✅ All done! Frontend should now serve the fresh build.")

if __name__ == "__main__":
    main()
