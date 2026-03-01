"use client";

import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { ApiError } from "@/services/api-error";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const { login } = useAuth();

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("L'adresse email est obligatoire");
      return;
    }
    if (!password) {
      setError("Le mot de passe est obligatoire");
      return;
    }
    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères");
      return;
    }
    try {
      await login(email, password);
      router.replace("/dashboard");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Une erreur est survenue");
      }
    }
  }
  return (
    <div className=" flex flex-col w-full max-w-110">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-black text-(--primary) mb-3">StockFlow</h1>
        <p className="opacity-60">Gestion d&apos;inventaire professionnelle</p>
      </div>

      <div className="flex flex-col bg-(--bg-card) rounded-xl border border-(--border) p-10">
        <div className="flex flex-col items-center">
          <h2 className="text-2xl">Bienvenue</h2>
          <p className="opacity-60 mt-5">
            Connectez-vous pour accéder à votre espace
          </p>
        </div>

        <div className="flex flex-col mt-5">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <Input
              label="Email"
              type="email"
              placeholder="email@exemple.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <Input
              label="Mot de passe"
              type="password"
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {error && (
              <p className="text-sm text-[#EF4444] text-center">{error}</p>
            )}
            <Button className="w-full " type="submit">
              Se connecter
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
