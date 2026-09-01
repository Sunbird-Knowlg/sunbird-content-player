import React from 'react';
import type { ContentPluginProps, ContentPluginRef } from './plugin.interface';
import { usePluginRegistry } from './plugin-registry';
import GenericPlugin from './generic/GenericPlugin';

interface Props extends ContentPluginProps {
  pluginRef?: React.Ref<ContentPluginRef>;
}


const PluginRenderer: React.FC<Props> = ({ pluginRef, ...props }) => {
  const registry = usePluginRegistry();
  const def = registry.resolve(props.contentData.mimeType);

  if (!def) {
    return (
      <GenericPlugin
        {...props}
        ref={pluginRef as React.Ref<ContentPluginRef>}
      />
    );
  }

  const Component = def.component;
  return <Component {...props} ref={pluginRef} />;
};

export default PluginRenderer;
