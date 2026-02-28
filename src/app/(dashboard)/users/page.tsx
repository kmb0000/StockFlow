"use client";

import { useEffect, useState } from "react";
import { CircleFadingPlus, ShieldCheck, Eye, EyeOff } from "lucide-react";

import Badge from "@/components/ui/badge";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import Select from "@/components/ui/select";
import SearchBar from "@/components/ui/search-input";
import Pagination from "@/components/ui/pagination";
import Modal from "@/components/ui/modal";

import { useAuth } from "@/hooks/use-auth";
import * as userService from "@/services/users.service";
import type {
  UserSafe,
  CreateUserPayload,
  UpdateUserPayload,
} from "@/services/users.service";

// ============================================================
// TYPES
// ============================================================

type UserRole = "ADMIN" | "MANAGER" | "EMPLOYEE";

const ROLE_BADGE: Record<UserRole, "blue" | "success" | "warning"> = {
  ADMIN: "blue",
  MANAGER: "success",
  EMPLOYEE: "warning",
};

const ROLE_LABEL: Record<UserRole, string> = {
  ADMIN: "Admin",
  MANAGER: "Manager",
  EMPLOYEE: "Employee",
};

// ============================================================
// HELPERS
// ============================================================

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// ============================================================
// COMPOSANT AVATAR
// ============================================================

function UserAvatar({ name, role }: { name: string; role: UserRole }) {
  const colors: Record<UserRole, string> = {
    ADMIN: "from-(--primary) to-blue-400",
    MANAGER: "from-emerald-500 to-emerald-300",
    EMPLOYEE: "from-amber-500 to-amber-300",
  };

  return (
    <div
      className={`h-10 w-10 shrink-0 rounded-xl bg-linear-to-br ${colors[role]} flex items-center justify-center text-xs font-black text-white shadow-md`}
    >
      {getInitials(name)}
    </div>
  );
}

// ============================================================
// FORMULAIRE CRÉATION / ÉDITION
// ============================================================

type UserFormProps = {
  initial?: UserSafe;
  onSubmit: (data: CreateUserPayload | UpdateUserPayload) => Promise<void>;
  onClose: () => void;
  loading: boolean;
  error: string;
};

function UserForm({
  initial,
  onSubmit,
  onClose,
  loading,
  error,
}: UserFormProps) {
  const isEdit = !!initial;

  const [name, setName] = useState(initial?.name ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>(initial?.role ?? "EMPLOYEE");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async () => {
    if (isEdit) {
      const payload: UpdateUserPayload = { name, email, role };
      if (password) payload.password = password;
      await onSubmit(payload);
    } else {
      const payload: CreateUserPayload = { name, email, password, role };
      await onSubmit(payload);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {error && (
        <div className="px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">
          {error}
        </div>
      )}

      <Input
        label="Nom complet"
        placeholder="Ex : Marie Dupont"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <Input
        label="Email"
        type="email"
        placeholder="marie@stockflow.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <div className="flex flex-col gap-1.5 w-full">
        <label className="text-sm font-semibold text-(--text-primary) ml-1">
          {isEdit ? "Nouveau mot de passe (optionnel)" : "Mot de passe"}
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder={
              isEdit ? "Laisser vide pour ne pas modifier" : "Min. 8 caractères"
            }
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2.5 pr-11 bg-(--bg-dark) border border-(--border) rounded-lg text-(--text-primary) text-sm transition-all outline-none focus:border-(--primary) focus:ring-2 focus:ring-(--primary)/10 placeholder:text-(--text-secondary)/50"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-(--text-secondary) hover:text-(--text-primary) transition-colors"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      <Select
        label="Rôle"
        value={role}
        onChange={(e) => setRole(e.target.value as UserRole)}
      >
        <option value="EMPLOYEE">Employee</option>
        <option value="MANAGER">Manager</option>
        <option value="ADMIN">Admin</option>
      </Select>

      <div className="flex gap-3 pt-2">
        <Button
          variant="secondary"
          className="flex-1"
          onClick={onClose}
          disabled={loading}
        >
          Annuler
        </Button>
        <Button className="flex-1" onClick={handleSubmit} disabled={loading}>
          {loading ? "Enregistrement..." : isEdit ? "Enregistrer" : "Créer"}
        </Button>
      </div>
    </div>
  );
}

// ============================================================
// PAGE PRINCIPALE
// ============================================================

export default function UsersPage() {
  const { user: currentUser } = useAuth();

  // --- State données ---
  const [users, setUsers] = useState<UserSafe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // --- State filtres ---
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // --- State modals ---
  const [modalCreate, setModalCreate] = useState(false);
  const [modalEdit, setModalEdit] = useState<UserSafe | null>(null);
  const [modalDelete, setModalDelete] = useState<UserSafe | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");

  // --- Fetch ---
  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      setLoading(true);
      const data = await userService.getAll();
      setUsers(data);
    } catch (err) {
      console.error("[Users] Erreur fetch:", err);
      setError("Erreur lors de la récupération des utilisateurs");
    } finally {
      setLoading(false);
    }
  }

  // --- Filtrage ---
  const filtered = users
    .filter((u) => {
      if (!search) return true;
      const s = search.toLowerCase();
      return (
        u.name.toLowerCase().includes(s) || u.email.toLowerCase().includes(s)
      );
    })
    .filter((u) => {
      if (!roleFilter) return true;
      return u.role === roleFilter;
    })
    .filter((u) => {
      if (!statusFilter) return true;
      return u.is_active === (statusFilter === "true");
    });

  // --- Pagination ---
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginated = filtered.slice(startIndex, startIndex + itemsPerPage);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  // --- Stats ---
  const stats = [
    {
      label: "Total utilisateurs",
      value: users.length,
      color: "text-(--text-primary)",
    },
    {
      label: "Admins",
      value: users.filter((u) => u.role === "ADMIN").length,
      color: "text-(--primary)",
    },
    {
      label: "Managers",
      value: users.filter((u) => u.role === "MANAGER").length,
      color: "text-emerald-400",
    },
    {
      label: "Employees",
      value: users.filter((u) => u.role === "EMPLOYEE").length,
      color: "text-amber-400",
    },
  ];

  // --- Actions ---
  async function handleCreate(data: CreateUserPayload | UpdateUserPayload) {
    try {
      setFormLoading(true);
      setFormError("");
      await userService.create(data as CreateUserPayload);
      await fetchUsers();
      setModalCreate(false);
    } catch (err: unknown) {
      setFormError(
        err instanceof Error ? err.message : "Erreur lors de la création",
      );
    } finally {
      setFormLoading(false);
    }
  }

  async function handleEdit(data: CreateUserPayload | UpdateUserPayload) {
    if (!modalEdit) return;
    try {
      setFormLoading(true);
      setFormError("");
      await userService.update(modalEdit.id, data as UpdateUserPayload);
      await fetchUsers();
      setModalEdit(null);
    } catch (err: unknown) {
      setFormError(
        err instanceof Error ? err.message : "Erreur lors de la modification",
      );
    } finally {
      setFormLoading(false);
    }
  }

  async function handleToggleActive(user: UserSafe) {
    try {
      await userService.update(user.id, { is_active: !user.is_active });
      await fetchUsers();
    } catch (err) {
      console.error("[Users] Erreur toggle active:", err);
    }
  }

  async function handleDelete() {
    if (!modalDelete) return;
    try {
      setFormLoading(true);
      setFormError("");
      await userService.deleteUser(modalDelete.id);
      await fetchUsers();
      setModalDelete(null);
    } catch (err: unknown) {
      setFormError(
        err instanceof Error ? err.message : "Erreur lors de la suppression",
      );
    } finally {
      setFormLoading(false);
    }
  }

  // --- Rendu ---
  if (loading)
    return (
      <div className="flex items-center justify-center min-h-100">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-(--primary)" />
      </div>
    );

  if (error)
    return (
      <div className="m-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
        {error}
      </div>
    );

  return (
    <div className="p-4 lg:p-8 space-y-8 max-w-400 mx-auto">
      {/* HEADER */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Utilisateurs</h1>
          <p className="text-(--text-secondary)">
            Gérez les comptes et les rôles des utilisateurs
          </p>
        </div>
        <Button
          onClick={() => {
            setFormError("");
            setModalCreate(true);
          }}
        >
          <CircleFadingPlus className="w-4 h-4" /> Ajouter un utilisateur
        </Button>
      </header>

      {/* NOTICE ADMIN */}
      <div className="flex items-center gap-3 px-4 py-3 bg-(--primary)/5 border border-(--primary)/20 rounded-xl text-sm text-blue-400">
        <ShieldCheck className="w-4 h-4 shrink-0" />
        <span>
          Section réservée aux administrateurs. Connecté en tant que{" "}
          <span className="font-bold">{currentUser?.name}</span>
        </span>
      </div>

      {/* FILTRES */}
      <div className="bg-(--bg-card) border border-(--border) p-4 rounded-2xl shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_auto] gap-4 items-end">
          <SearchBar
            placeholder="Nom, email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
          />
          <Select
            label="Rôle"
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">Tous</option>
            <option value="ADMIN">Admin</option>
            <option value="MANAGER">Manager</option>
            <option value="EMPLOYEE">Employee</option>
          </Select>
          <Select
            label="Statut"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">Tous</option>
            <option value="true">Actif</option>
            <option value="false">Inactif</option>
          </Select>
          <Button
            variant="secondary"
            onClick={() => {
              setSearch("");
              setRoleFilter("");
              setStatusFilter("");
            }}
          >
            Réinitialiser
          </Button>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="bg-(--bg-card) border border-(--border) p-5 rounded-2xl text-center shadow-sm hover:border-(--primary)/30 transition-colors"
          >
            <span className="text-(--text-secondary) text-xs uppercase tracking-widest font-bold">
              {stat.label}
            </span>
            <p className={`text-4xl font-black mt-2 ${stat.color}`}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* TABLE */}
      <div className="bg-(--bg-card) border border-(--border) rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-(--border)">
          <h2 className="text-xl font-bold">Liste des utilisateurs</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-(--bg-dark)/50 text-(--text-secondary) text-xs uppercase">
              <tr>
                <th className="px-6 py-4 font-bold">Utilisateur</th>
                <th className="px-6 py-4 font-bold">Rôle</th>
                <th className="px-6 py-4 font-bold">Statut</th>
                <th className="px-6 py-4 font-bold">Créé le</th>
                <th className="px-6 py-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-(--border)">
              {paginated.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-(--text-secondary)"
                  >
                    Aucun utilisateur trouvé
                  </td>
                </tr>
              ) : (
                paginated.map((u) => {
                  const isCurrentUser = currentUser?.id === u.id;
                  return (
                    <tr
                      key={u.id}
                      className="hover:bg-(--primary)/5 transition-colors group"
                    >
                      {/* Utilisateur */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <UserAvatar name={u.name} role={u.role} />
                          <div className="flex flex-col">
                            <span className="font-bold group-hover:text-(--primary) transition-colors">
                              {u.name}
                              {isCurrentUser && (
                                <span className="ml-2 text-xs font-medium text-(--text-secondary)">
                                  (vous)
                                </span>
                              )}
                            </span>
                            <span className="text-xs text-(--text-secondary)">
                              {u.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Rôle */}
                      <td className="px-6 py-4">
                        <Badge variant={ROLE_BADGE[u.role]}>
                          {ROLE_LABEL[u.role]}
                        </Badge>
                      </td>

                      {/* Statut */}
                      <td className="px-6 py-4">
                        <Badge variant={u.is_active ? "success" : "danger"}>
                          {u.is_active ? "Actif" : "Inactif"}
                        </Badge>
                      </td>

                      {/* Créé le */}
                      <td className="px-6 py-4 text-sm text-(--text-secondary)">
                        {formatDate(u.created_at)}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => {
                              setFormError("");
                              setModalEdit(u);
                            }}
                            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-(--primary)/10 text-(--primary) hover:bg-(--primary) hover:text-white transition-all cursor-pointer"
                          >
                            Modifier
                          </button>
                          {!isCurrentUser && (
                            <>
                              <button
                                onClick={() => handleToggleActive(u)}
                                className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-(--border) text-(--text-secondary) hover:border-(--primary) hover:text-(--primary) transition-all cursor-pointer"
                              >
                                {u.is_active ? "Désactiver" : "Activer"}
                              </button>
                              <button
                                onClick={() => {
                                  setFormError("");
                                  setModalDelete(u);
                                }}
                                className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-(--border) text-(--text-secondary) hover:border-red-500 hover:text-red-400 transition-all cursor-pointer"
                              >
                                Supprimer
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* FOOTER PAGINATION */}
        <footer className="flex flex-col sm:flex-row justify-between items-center p-6 border-t border-(--border) gap-4">
          <p className="text-xs font-medium text-(--text-secondary)">
            Affichage de{" "}
            <span className="text-(--text-primary)">
              {Math.min(startIndex + 1, filtered.length)}
            </span>{" "}
            à{" "}
            <span className="text-(--text-primary)">
              {Math.min(startIndex + itemsPerPage, filtered.length)}
            </span>{" "}
            sur {filtered.length} utilisateurs
          </p>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </footer>
      </div>

      {/* MODAL CRÉER */}
      <Modal
        isOpen={modalCreate}
        onClose={() => setModalCreate(false)}
        title="Ajouter un utilisateur"
      >
        <UserForm
          onSubmit={handleCreate}
          onClose={() => setModalCreate(false)}
          loading={formLoading}
          error={formError}
        />
      </Modal>

      {/* MODAL ÉDITER */}
      <Modal
        isOpen={!!modalEdit}
        onClose={() => setModalEdit(null)}
        title="Modifier l'utilisateur"
      >
        <UserForm
          initial={modalEdit ?? undefined}
          onSubmit={handleEdit}
          onClose={() => setModalEdit(null)}
          loading={formLoading}
          error={formError}
        />
      </Modal>

      {/* MODAL SUPPRIMER */}
      <Modal
        isOpen={!!modalDelete}
        onClose={() => setModalDelete(null)}
        title="Supprimer l'utilisateur"
      >
        <div className="flex flex-col gap-6">
          {formError && (
            <div className="px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">
              {formError}
            </div>
          )}
          <p className="text-(--text-secondary) text-sm">
            Êtes-vous sûr de vouloir supprimer{" "}
            <span className="font-bold text-(--text-primary)">
              {modalDelete?.name}
            </span>{" "}
            ? Cette action est irréversible.
          </p>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setModalDelete(null)}
              disabled={formLoading}
            >
              Annuler
            </Button>
            <Button
              variant="danger"
              className="flex-1"
              onClick={handleDelete}
              disabled={formLoading}
            >
              {formLoading ? "Suppression..." : "Supprimer"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
