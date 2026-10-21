'use client';

import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Flame, Flag, Heart, Laugh, Reply, Sparkles, ThumbsUp, Trash2, type LucideIcon } from 'lucide-react';
import { ensureUser, isSupabaseConfigured } from '@/lib/supabase/client';
import {
  addComment, CommentError, deleteComment, loadComments, reportComment, REACTION_KINDS, subscribeToComments, toggleReaction,
  type CommentNode, type CommentTarget, type ReactionKind,
} from '@/lib/plans/api';
import { rememberedName } from '@/lib/plans/displayName';
import { useAuth } from '@/lib/useAuth';
import { setDisplayName } from '@/lib/social/api';
import type { Locale, Translator } from '@/lib/i18n/locale';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Skeleton } from '@/components/ui/Skeleton';

const REACTION_ICONS: Record<ReactionKind, LucideIcon> = { like: ThumbsUp, love: Heart, laugh: Laugh, fire: Flame, wow: Sparkles };

const KNOWN_ERRORS = ['rate_limited', 'account_required', 'forbidden', 'invalid_body'] as const;

function ago(iso: string, locale: Locale, t: Translator): string {
  const seconds = Math.round((new Date(iso).getTime() - Date.now()) / 1000);
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  const steps: [Intl.RelativeTimeFormatUnit, number][] = [['day', 86400], ['hour', 3600], ['minute', 60]];
  for (const [unit, size] of steps) if (Math.abs(seconds) >= size) return rtf.format(Math.round(seconds / size), unit);
  return t('now');
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
  const t = useTranslations('comments');
  const all = useTranslations();
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
  const [notice, setNotice] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<(() => Promise<void>) | null>(null);
  const composer = useRef<HTMLTextAreaElement>(null);
  const nameInput = useRef<HTMLInputElement>(null);
  const accountPrompt = useRef<HTMLParagraphElement>(null);

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
  useEffect(() => { if (needsName) nameInput.current?.focus(); }, [needsName, pendingAction]);

  async function run(action: () => Promise<void>, retryAfterName = false) {
    setBusy(true); setError(null); setNotice(null);
    try { await action(); await refresh(); }
    catch (cause) {
      const code = cause instanceof CommentError ? cause.code : 'unknown';
      if (code === 'display_name_required') {
        setNeedsName(true);
        if (retryAfterName) setPendingAction(() => action);
      }
      else {
        const known = KNOWN_ERRORS.find(candidate => candidate === code);
        setError(known ? t(`errors.${known}`) : all('common.generic'));
      }
    } finally { setBusy(false); }
  }

  function reply(id: string) {
    if (!canWrite) {
      accountPrompt.current?.focus();
      return;
    }
    setReplyTo(id);
    composer.current?.focus();
  }

  function saveName(event: FormEvent) {
    event.preventDefault();
    if (!name.trim() || !pendingAction) return;
    void run(async () => {
      await setDisplayName(name.trim());
      await pendingAction();
      setPendingAction(null); setNeedsName(false);
    });
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
        <Button variant="secondary" onClick={() => setOpen(true)}>{t('show')}</Button>
      </section>
    );
  }

  const replyingTo = replyTo ? flatten(nodes ?? []).find(node => node.id === replyTo) : null;

  return (
    <section className="comments" aria-labelledby={`comments-${target.id}`}>
      <h2 id={`comments-${target.id}`} className="lead">{title}</h2>

      {loadFailed && <p className="plan-notice" role="alert">{t('loadFailed')}</p>}
      {nodes === null ? <Skeleton className="skeleton--row" /> : nodes.length === 0 && !loadFailed ? (
        <p className="muted">{t('empty')}</p>
      ) : (
        <ul className="comments__list">
          {nodes.map(node => (
            <Comment key={node.id} node={node} userId={userId} organizerId={organizerId} busy={busy}
              onReply={reply} onReact={(id, kind, already) => run(() => toggleReaction(id, userId!, kind, already), true)}
              onDelete={id => run(() => deleteComment(id))} onReport={id => run(async () => { await reportComment(id, userId!); setNotice(t('reported')); })} />
          ))}
        </ul>
      )}

      {error && <p className="plan-notice" role="alert">{error}</p>}
      {notice && <p role="status">{notice}</p>}
      {pendingAction && (
        <form className="comments__composer" onSubmit={saveName}>
          <p role="status">{t('nameRequired')}</p>
          <Field ref={nameInput} label={all('plan.new.yourName')} value={name} onChange={e => setName(e.target.value)} maxLength={40} autoComplete="given-name" />
          <Button type="submit" disabled={busy || !name.trim()}>{t('saveAndContinue')}</Button>
          <Button variant="secondary" type="button" disabled={busy} onClick={() => { setPendingAction(null); setNeedsName(false); }}>{t('cancel')}</Button>
        </form>
      )}

      {canWrite ? (
        <form className="comments__composer" onSubmit={submit}>
          {replyingTo && (
            <p className="small muted" role="status">{t('replyingTo', { name: replyingTo.authorName })} <button type="button" className="link-button" onClick={() => setReplyTo(null)}>{t('cancel')}</button></p>
          )}
          {needsName && !pendingAction && <Field ref={nameInput} label={all('plan.new.yourName')} value={name} onChange={e => setName(e.target.value)} maxLength={40} autoComplete="given-name" />}
          <div className="field">
            <label htmlFor={`comment-body-${target.id}`}>{t('commentLabel')}</label>
            <textarea ref={composer} id={`comment-body-${target.id}`} value={body} onChange={e => setBody(e.target.value)} rows={3} maxLength={1000} placeholder={t('placeholder')} />
          </div>
          <Button type="submit" disabled={busy || !!pendingAction || !body.trim()}>{t('send')}</Button>
        </form>
      ) : target.type === 'event' ? (
        <p ref={accountPrompt} tabIndex={-1} className="muted">
          {t.rich('signIn', { link: chunks => <Link href="/konto">{chunks}</Link> })}
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
  const t = useTranslations('comments');
  const locale = useLocale();
  const mine = node.authorId === userId;
  const canDelete = !node.deleted && (mine || (organizerId !== undefined && organizerId === userId));
  return (
    <li className={`comment comment--d${node.depth}`}>
      <div className="comment__head">
        <span className="comment__author">{node.authorName}</span>
        <time className="muted small" dateTime={node.createdAt}>{ago(node.createdAt, locale, t)}</time>
      </div>
      {node.deleted
        ? <p className="muted comment__body">{t('removed')}</p>
        : <p className="comment__body">{node.body}</p>}

      {!node.deleted && (
        <div className="comment__actions">
          <div className="reactions" role="group" aria-label={t('reactionsGroup')}>
            {REACTION_KINDS.map(kind => {
              const Icon = REACTION_ICONS[kind];
              const count = node.reactions[kind] ?? 0;
              const active = node.mine.includes(kind);
              return (
                <button key={kind} type="button" className="reaction" aria-pressed={active} aria-label={t('reactionLabel', { label: t(`reactions.${kind}`), count })} disabled={busy || !userId}
                  onClick={() => onReact(node.id, kind, active)}>
                  <Icon size={16} aria-hidden="true" />{count > 0 && <span>{count}</span>}
                </button>
              );
            })}
          </div>
          <button type="button" className="link-button" disabled={busy} onClick={() => onReply(node.id)}><Reply size={16} aria-hidden="true" />{t('reply')}</button>
          {canDelete && <button type="button" className="link-button" disabled={busy} onClick={() => onDelete(node.id)}><Trash2 size={16} aria-hidden="true" />{t('delete')}</button>}
          {!mine && userId && <button type="button" className="link-button" disabled={busy} onClick={() => onReport(node.id)}><Flag size={16} aria-hidden="true" />{t('report')}</button>}
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
