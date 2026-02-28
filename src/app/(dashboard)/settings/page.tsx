"use client";

import { useState } from "react";
import { Settings, User, Lock, CheckCircle } from "lucide-react";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";

export default function SettingsPage() {
  const { user, updateCurrentUser } = useAuth();

  // --- State formulaire profil ---
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState(false);

  // --- State formulaire mot de passe ---
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  async function handleProfileSubmit() {
    try {
      setProfileLoading(true);
      setProfileError("");
      setProfileSuccess(false);
      await updateCurrentUser({ name, email });
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (err: unknown) {
      setProfileError(
        err instanceof Error ? err.message : "Erreur lors de la mise à jour",
      );
    } finally {
      setProfileLoading(false);
    }
  }

  async function handlePasswordSubmit() {
    setPasswordError("");
    setPasswordSuccess(false);

    if (password.length < 8) {
      setPasswordError("Le mot de passe doit contenir au moins 8 caractères");
      return;
    }
    if (password !== passwordConfirm) {
      setPasswordError("Les mots de passe ne correspondent pas");
      return;
    }

    try {
      setPasswordLoading(true);
      await updateCurrentUser({ password });
      setPassword("");
      setPasswordConfirm("");
      setPasswordSuccess(true);
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (err: unknown) {
      setPasswordError(
        err instanceof Error ? err.message : "Erreur lors de la mise à jour",
      );
    } finally {
      setPasswordLoading(false);
    }
  }

  return (
    <div className="p-4 lg:p-8 space-y-8 max-w-2xl mx-auto">
      {/* HEADER */}
      <header>
        <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
          <Settings className="w-7 h-7 text-(--primary)" />
          Paramètres
        </h1>
        <p className="text-(--text-secondary) mt-1">
          Gérez les informations de votre compte
        </p>
      </header>

      {/* INFOS COMPTE */}
      <div className="bg-(--bg-card) border border-(--border) rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-(--border) flex items-center gap-3">
          <div className="p-2 bg-(--primary)/10 rounded-lg">
            <User className="w-4 h-4 text-(--primary)" />
          </div>
          <h2 className="font-bold text-lg">Informations du profil</h2>
        </div>

        <div className="p-6 space-y-4">
          {/* Badge rôle */}
          <div className="flex items-center gap-3 px-4 py-3 bg-(--bg-dark) rounded-xl border border-(--border)">
            <span className="text-sm text-(--text-secondary)">
              Rôle actuel :
            </span>
            <span className="text-sm font-bold text-(--primary)">
              {user?.role}
            </span>
            <span className="text-xs text-(--text-secondary) ml-auto">
              Non modifiable
            </span>
          </div>

          <Input
            label="Nom complet"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Votre nom"
          />

          <Input
            label="Adresse email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="votre@email.com"
          />

          {profileError && (
            <p className="text-sm text-red-400 px-1">{profileError}</p>
          )}

          {profileSuccess && (
            <div className="flex items-center gap-2 text-sm text-green-400 px-1">
              <CheckCircle className="w-4 h-4" />
              Profil mis à jour avec succès
            </div>
          )}

          <div className="flex justify-end pt-2">
            <Button onClick={handleProfileSubmit} disabled={profileLoading}>
              {profileLoading ? "Enregistrement..." : "Sauvegarder"}
            </Button>
          </div>
        </div>
      </div>

      {/* MOT DE PASSE */}
      <div className="bg-(--bg-card) border border-(--border) rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-(--border) flex items-center gap-3">
          <div className="p-2 bg-(--primary)/10 rounded-lg">
            <Lock className="w-4 h-4 text-(--primary)" />
          </div>
          <h2 className="font-bold text-lg">Changer le mot de passe</h2>
        </div>

        <div className="p-6 space-y-4">
          <Input
            label="Nouveau mot de passe"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Min. 8 caractères"
          />

          <Input
            label="Confirmer le mot de passe"
            type="password"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            placeholder="Répétez le mot de passe"
          />

          {passwordError && (
            <p className="text-sm text-red-400 px-1">{passwordError}</p>
          )}

          {passwordSuccess && (
            <div className="flex items-center gap-2 text-sm text-green-400 px-1">
              <CheckCircle className="w-4 h-4" />
              Mot de passe mis à jour avec succès
            </div>
          )}

          <div className="flex justify-end pt-2">
            <Button onClick={handlePasswordSubmit} disabled={passwordLoading}>
              {passwordLoading ? "Enregistrement..." : "Mettre à jour"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
