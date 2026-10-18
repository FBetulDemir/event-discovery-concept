'use client';

import { useCallback, useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { Flame, Flag, Heart, Laugh, Reply, Sparkles, ThumbsUp, Trash2, type LucideIcon } from 'lucide-react';
import { ensureUser, isSupabaseConfigured } from '@/lib/supabase/client';
import {
  addComment, CommentError, deleteComment, loadComments, reportComment, REACTIONS, subscribeToComments, toggleReaction,
  type CommentNode, type CommentTarget, type ReactionKind,
} from '@/lib/plans/api';
import { rememberedName } from '@/lib/plans/displayName';
import { useAuth } from '@/lib/useAuth';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Skeleton } from '@/components/ui/Skeleton';

const REACTION_ICONS: Record<ReactionKind, LucideIcon> = { like: ThumbsUp, love: Heart, laugh: Laugh, fire: Flame, wow: Sparkles };

const ERRORS: Partial<Record<CommentError['code'], string>> = {
  rate_limited: 'Du skriver för snabbt. Vänta en minut.',
  account_required: 'Du behöver ett konto för att kommentera event.',
  forbidden: 'Du kan inte kommentera här.',
  invalid_body: 'Skriv något först (högst 1000 tecken).',
};

function ago(iso: string): string {
  const seconds = Math.round((new Date(iso).getTime() - Date.now()) / 1000);
  const rtf = new Intl.RelativeTimeFormat('sv', { numeric: 'auto' });
  const steps: [Intl.RelativeTimeFormatUnit, number][] = [['day', 86400], ['hour', 3600], ['minute', 60]];
  for (const [unit, size] of steps) if (Math.abs(seconds) >= size) return rtf.format(Math.round(seconds / size), unit);
  return 'just nu';
}

type Props = {
  target: CommentTarget;
  /** Plan threads: the organizer may remove anyone's comment (the database enforces it too). */
  organizerId?: string;
  title: string;
  /** Event threads are public: reading needs a session, which we only start on request. */
  startClosed?: boolean;
};

/** A Facebook-style thread: replies two levels deep, reactions, delete, report, live updates. */
export function CommentThread({ target, organizerId, title, startClosed = false }: Props) {
  const auth = useAuth();
  const [open, setOpen] = useState(!startClosed);
  const [nodes, setNodes] = useState<CommentNode[] | null>(null);
  const [me, setMe] = useState<string | null>(null);
  const [body, setBody] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [needsName, setNeedsName] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [busy, setBusy] = useState(false);

  const userId = auth.status === 'guest' || auth.status === 'account' ? auth.userId : me;
  const canWrite = target.type === 'plan' ? userId !== null : auth.status === 'account';

  const refresh = useCallback(async () => {
    try {
      const user = target.type === 'plan' ? { id: userId } : await ensureUser();
      setNodes(await loadComments(target, user.id));
      setMe(user.id);
      setLoadFailed(false);
    } catch {
      // Say so instead of pretending the thread is empty.
      setLoadFailed(true);
      setNodes(current => current ?? []);
    }
  }, [target, userId]);

  useEffect(() => {
    if (!isSupabaseConfigured || !open || (target.type === 'plan' && !userId)) return;
    void refresh();
    return subscribeToComments(target, () => void refresh());
  }, [open, target, userId, refresh]);

  useEffect(() => { setName(rememberedName()); }, []);

  async function run(action: () => Promise<void>) {
    setBusy(true); setError(null);
    try { await action(); await refresh(); }
    catch (cause) {
      const code = cause instanceof CommentError ? cause.code : 'unknown';
      if (code === 'display_name_required') setNeedsName(true);
      else setError(ERRORS[code] ?? 'Något gick fel, försök igen.');
    } finally { setBusy(false); }
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!body.trim()) return;
    void run(async () => {
      await addComment(target, body, replyTo, needsName ? name : undefined);
      setBody(''); setReplyTo(null); setNeedsName(false);
    });
  }

  if (!open) {
    return (
      <section className="comments" aria-labelledby={`comments-${target.id}`}>
        <h2 id={`comments-${target.id}`} className="lead">{title}</h2>
        <Button variant="secondary" onClick={() => setOpen(true)}>Visa kommentarer</Button>
      </section>
    );
  }

  const replyingTo = replyTo ? flatten(nodes ?? []).find(node => node.id === replyTo) : null;

  return (
    <section className="comments" aria-labelledby={`comments-${target.id}`}>
      <h2 id={`comments-${target.id}`} className="lead">{title}</h2>

      {loadFailed && <p className="plan-notice" role="alert">Kunde inte hämta kommentarerna just nu.</p>}
      {nodes === null ? <Skeleton className="skeleton--row" /> : nodes.length === 0 && !loadFailed ? (
        <p className="muted">Inga kommentarer än. Skriv den första.</p>
      ) : (
        <ul className="comments__list">
          {nodes.map(node => (
            <Comment key={node.id} node={node} userId={userId} organizerId={organizerId} busy={busy}
              onReply={setReplyTo} onReact={(id, kind, already) => run(() => toggleReaction(id, userId!, kind, already))}
              onDelete={id => run(() => deleteComment(id))} onReport={id => run(() => reportComment(id, userId!))} />
          ))}
        </ul>
      )}

      {canWrite ? (
        <form className="comments__composer" onSubmit={submit}>
          {replyingTo && (
            <p className="small muted">Svarar {replyingTo.authorName}. <button type="button" className="link-button" onClick={() => setReplyTo(null)}>Avbryt</button></p>
          )}
          {needsName && <Field label="Ditt namn" value={name} onChange={e => setName(e.target.value)} maxLength={40} autoComplete="given-name" />}
          <div className="field">
            <label htmlFor={`comment-body-${target.id}`}>Kommentar</label>
            <textarea id={`comment-body-${target.id}`} value={body} onChange={e => setBody(e.target.value)} rows={3} maxLength={1000} placeholder="Vad tycker du?" />
          </div>
          {error && <p className="plan-notice" role="alert">{error}</p>}
          <Button type="submit" disabled={busy || !body.trim()}>Skicka</Button>
        </form>
      ) : target.type === 'event' ? (
        <p className="muted">
          <Link href="/konto">Logga in</Link> för att kommentera. Event-kommentarer är offentliga, därför krävs ett konto.
        </p>
      ) : null}
    </section>
  );
}

function flatten(nodes: CommentNode[]): CommentNode[] {
  return nodes.flatMap(node => [node, ...flatten(node.replies)]);
}

type ItemProps = {
  node: CommentNode; userId: string | null; organizerId?: string; busy: boolean;
  onReply: (id: string) => void;
  onReact: (id: string, kind: ReactionKind, already: boolean) => void;
  onDelete: (id: string) => void;
  onReport: (id: string) => void;
};

function Comment({ node, userId, organizerId, busy, onReply, onReact, onDelete, onReport }: ItemProps) {
  const mine = node.authorId === userId;
  const canDelete = !node.deleted && (mine || (organizerId !== undefined && organizerId === userId));
  return (
    <li className={`comment comment--d${node.depth}`}>
      <div className="comment__head">
        <span className="comment__author">{node.authorName}</span>
        <time className="muted small" dateTime={node.createdAt}>{ago(node.createdAt)}</time>
      </div>
      {node.deleted
        ? <p className="muted comment__body">Kommentaren är borttagen.</p>
        : <p className="comment__body">{node.body}</p>}

      {!node.deleted && (
        <div className="comment__actions">
          <div className="reactions" role="group" aria-label="Tepp">
            {REACTIONS.map(({ kind, label }) => {
              const Icon = REACTION_ICONS[kind];
              const count = node.reactions[kind] ?? 0;
              const active = node.mine.includes(kind);
              return (
                <button key={kind} type="button" className="reaction" aria-pressed={active} aria-label={`${label}, ${count}`} disabled={busy || !userId}
                  onClick={() => onReact(node.id, kind, active)}>
                  <Icon size={16} aria-hidden="true" />{count > 0 && <span>{count}</span>}
                </button>
              );
            })}
          </div>
          <button type="button" className="link-button" onClick={() => onReply(node.id)}><Reply size={16} aria-hidden="true" />Svara</button>
          {canDelete && <button type="button" className="link-button" onClick={() => onDelete(node.id)}><Trash2 size={16} aria-hidden="true" />Ta bort</button>}
          {!mine && userId && <button type="button" className="link-button" onClick={() => onReport(node.id)}><Flag size={16} aria-hidden="true" />Rapportera</button>}
        </div>
      )}

      {node.replies.length > 0 && (
        <ul className="comments__list comments__list--replies">
          {node.replies.map(reply => (
            <Comment key={reply.id} node={reply} userId={userId} organizerId={organizerId} busy={busy}
              onReply={onReply} onReact={onReact} onDelete={onDelete} onReport={onReport} />
          ))}
        </ul>
      )}
    </li>
  );
}
