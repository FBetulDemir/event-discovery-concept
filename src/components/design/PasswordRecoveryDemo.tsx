'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { PasswordRecovery } from '@/components/account/PasswordRecovery';
import { Chip } from '@/components/ui/Chip';
import type { RecoveryState } from '@/lib/password-recovery';

/** Gallery actions are isolated from Auth: no email is sent and no password is changed. */
export function PasswordRecoveryDemo() {
  const t = useTranslations('account.reset');
  const [state, setState] = useState<RecoveryState | 'request'>('request');
  return (
    <>
      <div className="design__row" role="group" aria-label={t('title')}>
        <Chip selected={state === 'request'} onClick={() => setState('request')}>{t('title')}</Chip>
        <Chip selected={state === 'ready'} onClick={() => setState('ready')}>{t('newTitle')}</Chip>
        <Chip selected={state === 'invalid'} onClick={() => setState('invalid')}>{t('invalidDemo')}</Chip>
      </div>
      <PasswordRecovery embedded key={state} state={state} initialEmail="" onBack={() => setState('request')}
        requestReset={async () => {}} updatePassword={async () => { setState('complete'); }} />
    </>
  );
}
