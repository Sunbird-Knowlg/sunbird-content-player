import React from 'react';
import type { ContentPluginProps, ContentPluginRef } from '../plugin.interface';
import { t } from '../../i18n/i18n';
import { COLORS, FONT_FAMILY } from '../../constants';

const GenericPlugin = React.forwardRef<ContentPluginRef, ContentPluginProps>(
  ({ language, onReady }, _ref) => {
    React.useEffect(() => { onReady(); }, [onReady]);

    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        background: COLORS.ivory,
        fontFamily: FONT_FAMILY,
        gap: 8,
        padding: 24,
        textAlign: 'center',
      }}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none"
          stroke={COLORS.gray400} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
        </svg>
        <p style={{ fontSize: 15, fontWeight: 600, color: COLORS.obsidian }}>
          {t(language, 'UNSUPPORTED')}
        </p>
        <p style={{ fontSize: 12, color: COLORS.gray500 }}>
          {t(language, 'UNSUPPORTED_SUB')}
        </p>
      </div>
    );
  }
);

GenericPlugin.displayName = 'GenericPlugin';

export default GenericPlugin;
