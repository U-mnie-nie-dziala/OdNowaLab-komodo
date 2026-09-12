"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/components/Toast";
import { companiesApi, ApiError } from "@/lib/api";
import type { CompanyResponseDto } from "@/lib/types";
import { PageHeader } from "@/components/PageHeader";
import { formatNip } from "@/lib/format";
import {
  StoreIcon,
  MapPinIcon,
  AlertIcon,
  UserIcon,
  PlusIcon,
  TrashIcon,
} from "@/components/icons";

const DESC_MAX = 200;
const MAX_IMG_BYTES = 10 * 1024 * 1024;

export default function AccountPage() {
  const { session } = useAuth();
  const toast = useToast();
  const companyId = session!.companyId;

  const [company, setCompany] = useState<CompanyResponseDto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);

  // Zdjęcie sklepu
  const fileRef = useRef<HTMLInputElement>(null);
  const [photoMode, setPhotoMode] = useState<"upload" | "update">("upload");
  const [imgVer, setImgVer] = useState(0);
  const [imgError, setImgError] = useState(false);
  const [uploading, setUploading] = useState(false);

  const hasImage = Boolean(company?.picture) && !imgError;

  function pickFile(mode: "upload" | "update") {
    setPhotoMode(mode);
    fileRef.current?.click();
  }

  async function onFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !company) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Nieprawidłowy plik", "Wybierz obraz (JPG, PNG, GIF lub WEBP).");
      return;
    }
    if (file.size > MAX_IMG_BYTES) {
      toast.error("Plik jest za duży", "Maksymalny rozmiar to 10 MB.");
      return;
    }
    setUploading(true);
    try {
      const updated =
        photoMode === "update"
          ? await companiesApi.updateImage(company.id, file)
          : await companiesApi.uploadImage(company.id, file);
      setCompany(updated);
      setImgError(false);
      setImgVer((v) => v + 1);
      toast.success("Zdjęcie zapisane");
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : err instanceof Error ? err.message : undefined;
      toast.error("Nie udało się zapisać zdjęcia", msg);
    } finally {
      setUploading(false);
    }
  }

  async function removePhoto() {
    if (!company) return;
    if (!window.confirm("Usunąć zdjęcie sklepu?")) return;
    setUploading(true);
    try {
      await companiesApi.deleteImage(company.id);
      setCompany({ ...company, picture: null });
      setImgError(false);
      toast.success("Zdjęcie usunięte");
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : err instanceof Error ? err.message : undefined;
      toast.error("Nie udało się usunąć zdjęcia", msg);
    } finally {
      setUploading(false);
    }
  }

  const load = useCallback(async () => {
    setError(null);
    try {
      const c = await companiesApi.get(companyId);
      setCompany(c);
      setDescription(c.description);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nie udało się wczytać danych sklepu.");
    }
  }, [companyId]);

  useEffect(() => {
    load();
  }, [load]);

  async function saveDescription() {
    if (!company) return;
    const next = description.trim();
    if (!next) {
      toast.error("Opis nie może być pusty");
      return;
    }
    if (next.length > DESC_MAX) {
      toast.error(`Opis może mieć maks. ${DESC_MAX} znaków`);
      return;
    }
    setBusy(true);
    try {
      const updated = await companiesApi.update(company.id, {
        name: company.name,
        locationX: company.locationX,
        locationY: company.locationY,
        description: next,
        ownerId: company.ownerId,
        isInRevitalizationZone: company.isInRevitalizationZone,
        picture: company.picture,
      });
      setCompany(updated);
      setDescription(updated.description);
      setEditing(false);
      toast.success("Opis zapisany");
    } catch (err) {
      const msg =
        err instanceof ApiError ? err.message : err instanceof Error ? err.message : undefined;
      toast.error("Nie udało się zapisać opisu", msg);
    } finally {
      setBusy(false);
    }
  }

  function cancelEdit() {
    setDescription(company?.description ?? "");
    setEditing(false);
  }

  return (
    <div>
      <PageHeader
        title="Moje konto"
        subtitle="Dane Twojego sklepu w Wołomińskim Programie Partnerskim."
      />

      {error && (
        <div className="mb-6 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertIcon className="mt-0.5 h-4 w-4 shrink-0" /> {error}
        </div>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/png,image/jpeg,image/gif,image/webp"
        className="hidden"
        onChange={onFileSelected}
      />

      <div className="card mb-6 p-6">
        <div className="flex items-center gap-2 text-brand-700">
          <StoreIcon className="h-5 w-5" />
          <h2 className="text-lg font-bold text-brand-900">Zdjęcie sklepu</h2>
        </div>
        <p className="mt-1 text-sm text-[var(--ink-soft)]">
          Zdjęcie widoczne dla klientów w programie. JPG, PNG, GIF lub WEBP, do 10 MB.
        </p>

        <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="aspect-[16/10] w-full max-w-xs shrink-0 overflow-hidden border-2 border-[var(--ink)]/15 bg-lav-100">
            {hasImage && company ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={`${companiesApi.imageUrl(company.id)}?t=${imgVer}`}
                alt={`Zdjęcie sklepu ${company.name}`}
                className="h-full w-full object-cover"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-slate-400">
                <StoreIcon className="h-9 w-9" />
                <span className="text-xs font-medium">Brak zdjęcia</span>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {hasImage ? (
              <>
                <button
                  type="button"
                  className="btn-outline"
                  onClick={() => pickFile("update")}
                  disabled={uploading || !company}
                >
                  {uploading ? "Przetwarzanie…" : "Zmień zdjęcie"}
                </button>
                <button
                  type="button"
                  className="btn border-2 border-red-500 bg-white text-red-600 hover:bg-red-50"
                  onClick={removePhoto}
                  disabled={uploading || !company}
                >
                  <TrashIcon className="h-4 w-4" /> Usuń
                </button>
              </>
            ) : (
              <button
                type="button"
                className="btn-primary"
                onClick={() => pickFile("upload")}
                disabled={uploading || !company}
              >
                <PlusIcon className="h-4 w-4" /> {uploading ? "Wgrywanie…" : "Dodaj zdjęcie"}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="card p-6">
          <div className="flex items-center gap-2 text-brand-700">
            <StoreIcon className="h-5 w-5" />
            <h2 className="text-lg font-bold text-brand-900">
              {company?.name ?? session!.companyName}
            </h2>
          </div>

          <dl className="mt-5 space-y-4 text-sm">
            <Info label="NIP" value={session!.nip ? formatNip(session!.nip) : "–"} />
            <Info
              label="Adres"
              value={session!.address ?? "–"}
              icon={<MapPinIcon className="h-4 w-4" />}
            />

            <div>
              <div className="mb-1.5 flex items-center justify-between gap-3">
                <dt className="text-[var(--ink-soft)]">Opis</dt>
                {!editing && company && (
                  <button
                    type="button"
                    className="text-xs font-semibold text-brand-700 hover:underline"
                    onClick={() => setEditing(true)}
                  >
                    Edytuj
                  </button>
                )}
              </div>
              {editing ? (
                <div className="space-y-3">
                  <textarea
                    className="input min-h-[110px] resize-y"
                    value={description}
                    maxLength={DESC_MAX}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Krótko opisz, czym zajmuje się Twój sklep…"
                  />
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs text-slate-400">
                      {description.length}/{DESC_MAX}
                    </span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className="btn-outline px-3 py-2 text-xs"
                        onClick={cancelEdit}
                        disabled={busy}
                      >
                        Anuluj
                      </button>
                      <button
                        type="button"
                        className="btn-primary px-3 py-2 text-xs"
                        onClick={saveDescription}
                        disabled={busy || description.trim() === (company?.description ?? "")}
                      >
                        {busy ? "Zapisywanie…" : "Zapisz"}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <dd className="rounded-xl bg-slate-50 px-4 py-3 font-medium text-[var(--ink)]">
                  {company?.description ?? "–"}
                </dd>
              )}
            </div>
          </dl>
        </div>

        <div className="card h-fit p-6">
          <div className="flex items-center gap-2 text-brand-700">
            <UserIcon className="h-5 w-5" />
            <h2 className="text-lg font-bold text-brand-900">Właściciel</h2>
          </div>
          <dl className="mt-4 space-y-3 text-sm">
            <Info label="Imię i nazwisko" value={session!.ownerName} />
            <Info label="E-mail" value={session!.email} />
          </dl>
        </div>
      </div>
    </div>
  );
}

function Info({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="shrink-0 text-[var(--ink-soft)]">{label}</dt>
      <dd className="flex items-center gap-1.5 text-right font-medium text-[var(--ink)]">
        {icon && <span className="text-brand-500">{icon}</span>}
        <span className="break-words">{value}</span>
      </dd>
    </div>
  );
}
