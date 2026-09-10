'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useUsers, useSaveUser, useDeleteUser, type UserRow } from '@/lib/cms/admin-hooks';
import { useCities } from '@/lib/cms/hooks';
import { PageHeader, Button, DataTable, Dialog, Field, Input, Select, Toggle, EmptyState, useToast, useConfirm, type Column } from './ui';
import { EntitySelect } from './entity-select';
import { formatDate } from '@/lib/utils/format';

const ROLES = ['SUPER_ADMIN', 'EDITOR', 'CONTRIBUTOR'] as const;

interface Draft {
  id?: string;
  email: string;
  name: string;
  password: string;
  role: string;
  isActive: boolean;
  cityScopeIds: string[];
}

const empty: Draft = { email: '', name: '', password: '', role: 'CONTRIBUTOR', isActive: true, cityScopeIds: [] };

export function UsersView() {
  const { data, isLoading } = useUsers();
  const save = useSaveUser();
  const del = useDeleteUser();
  const cities = useCities();
  const toast = useToast();
  const confirm = useConfirm();
  const [draft, setDraft] = useState<Draft | null>(null);

  const cityOpts = (cities.data ?? []).map((c) => ({ id: c.id, name: c.name }));

  const columns: Column<UserRow>[] = [
    { key: 'name', header: 'Name', primary: true, cell: (r) => (
      <span>
        {r.name}
        <span className="text-muted block text-[11px]">{r.email}</span>
      </span>
    ) },
    { key: 'role', header: 'Role', cell: (r) => <span className="text-[13px]">{r.role.replace('_', ' ').toLowerCase()}</span> },
    {
      key: 'active',
      header: 'Status',
      cell: (r) => (
        <span
          className={
            'inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold ' +
            (r.isActive
              ? 'bg-[--color-success-50] text-[--color-success-700] border-[--color-success-600]/20'
              : 'bg-canvas text-muted border-line')
          }
        >
          {r.isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    { key: '2fa', header: '2FA', width: 'w-14', cell: (r) => (r.totpEnabled ? 'On' : '—') },
    { key: 'last', header: 'Last login', cell: (r) => <span className="text-muted text-[12px]">{r.lastLoginAt ? formatDate(r.lastLoginAt) : 'never'}</span> },
  ];

  const submit = async () => {
    if (!draft) return;
    if (!draft.email.trim() || !draft.name.trim() || (!draft.id && draft.password.length < 8)) {
      toast('Email, name and an 8+ char password are required', 'info');
      return;
    }
    try {
      await save.mutateAsync({
        id: draft.id,
        email: draft.email,
        name: draft.name,
        role: draft.role,
        isActive: draft.isActive,
        cityScopeIds: draft.cityScopeIds,
        ...(draft.password ? { password: draft.password } : {}),
      });
      toast(draft.id ? 'User updated' : 'User created', 'success');
      setDraft(null);
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Save failed', 'error');
    }
  };

  return (
    <div>
      <PageHeader
        title="Users"
        subtitle="Who can sign in to the CMS."
      />
      
      <div className="mb-4 flex items-center gap-2">
        <div className="flex-1" />
        <Button onClick={() => setDraft({ ...empty })}>
          <Plus className="h-4 w-4" /> New user
        </Button>
      </div>
      
      <DataTable
        columns={columns}
        rows={data ?? []}
        loading={isLoading}
        onRowClick={(r) =>
          setDraft({
            id: r.id,
            email: r.email,
            name: r.name,
            password: '',
            role: r.role,
            isActive: r.isActive,
            cityScopeIds: r.cityScope.map((c) => c.id),
          })
        }
        empty={<EmptyState title="No users" />}
      />

      <Dialog
        open={!!draft}
        onClose={() => setDraft(null)}
        title={draft?.id ? 'Edit user' : 'New user'}
        footer={
          <div className="flex w-full items-center justify-between">
            {draft?.id ? (
              <Button
                variant="danger"
                size="sm"
                onClick={async () => {
                  const ok = await confirm({ title: `Delete ${draft.name}?`, danger: true, confirmLabel: 'Delete' });
                  if (!ok) return;
                  await del.mutateAsync(draft.id!);
                  toast('User deleted', 'success');
                  setDraft(null);
                }}
              >
                Delete
              </Button>
            ) : (
              <span />
            )}
            <Button size="sm" loading={save.isPending} onClick={submit}>
              Save
            </Button>
          </div>
        }
      >
        {draft && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Name" required>
                <Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
              </Field>
              <Field label="Email" required>
                <Input type="email" value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} />
              </Field>
            </div>
            <Field
              label={draft.id ? 'New password' : 'Password'}
              required={!draft.id}
              hint={draft.id ? 'Leave blank to keep the current password.' : 'At least 8 characters.'}
            >
              <Input
                type="password"
                value={draft.password}
                onChange={(e) => setDraft({ ...draft, password: e.target.value })}
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Role">
                <Select value={draft.role} onChange={(e) => setDraft({ ...draft, role: e.target.value })}>
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r.replace('_', ' ').toLowerCase()}
                    </option>
                  ))}
                </Select>
              </Field>
              <div className="flex items-end pb-2">
                <Toggle checked={draft.isActive} onChange={(v) => setDraft({ ...draft, isActive: v })} label="Active" />
              </div>
            </div>
            <Field label="City scope" hint="Leave empty for all cities.">
              <EntitySelect
                options={cityOpts}
                value={draft.cityScopeIds}
                onChange={(ids) => setDraft({ ...draft, cityScopeIds: ids })}
                placeholder="Limit to cities…"
              />
            </Field>
          </div>
        )}
      </Dialog>
    </div>
  );
}
