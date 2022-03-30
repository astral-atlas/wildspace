// @flow strict
/*:: import type { Component } from '@lukekaalim/act'; */

import { h, useRef } from "@lukekaalim/act";
import styles from './index.module.css';

/*::
export type EditorFormProps = {
  onEditorSubmit?: () => void,
  [string]: mixed,
};
*/

export const EditorForm/*: Component<EditorFormProps>*/ = ({ children, onEditorSubmit, ...props }) => {
  const onSubmit = (event) => {
    event.preventDefault();
    onEditorSubmit && onEditorSubmit();
  };
  return h('form', { ...props, onSubmit, classList: [styles.editorForm] }, children)
};
/*::
export type EditorFormSubmitProps = {
  label?: string,
};
*/

export const EditorFormSubmit/*: Component<EditorFormSubmitProps>*/ = ({ label = '' }) => {
  return h('input', { type: 'submit', value: label || 'Submit', classList: [styles.editorFormSubmit] })
}

/*::
export type TextEditorProps = {
  label?: string,
  text?: string,
  disabled?: boolean,
  onTextChange?: string => mixed,
  [string]: mixed,
};
*/

export const EditorTextInput/*: Component<TextEditorProps>*/ = ({ text = '', label, disabled, onTextChange }) => {
  const onInput = (event) => {
    onTextChange && onTextChange(event.target.value);
  }
  return h('label', { classList: [styles.editorRoot] }, [
    h('span', {}, label),
    h('input', { type: 'text', value: text, onInput, disabled })
  ]);
};

/*::
export type SingleFileEditorProps = {
  label?: string,
  multiple?: boolean,
  accept?: string,
  files?: ?FileList,
  onFilesChange?: FileList => mixed,
  [string]: mixed,
};
*/

export const FilesEditor/*: Component<SingleFileEditorProps>*/ = ({
  files,
  label,
  onFilesChange,
  multiple,
  accept,
}) => {
  const onInput = (event) => {
    onFilesChange && onFilesChange(event.target.files);
  }
  return h('label', { classList: [styles.editorRoot] }, [
    h('span', {}, label),
    h('input', { type: 'file', multiple, accept, onInput, files })
  ]);
};

/*::
export type SelectEditorProps = {
  label?: string,
  selected?: string,
  values?: { title: string, value: string }[],
  onSelectedChange?: FileList => mixed,
  [string]: mixed,
};
*/
export const SelectEditor/*: Component<SelectEditorProps>*/ = ({
  label,
  selected,
  values = [],
  onSelectedChange,
  ...props
}) => {
  const onChange = (event) => {
    onSelectedChange && onSelectedChange(event.target.value);
  }
  return h('label', { ...props, classList: [styles.editorRoot] }, [
    h('span', {}, label),
    h('select', { onChange }, values.map(({ title, value }) =>
      h('option', { key: value, value, selected: value === selected }, title)))
  ]);
}


/*::
export type EditorButtonProps = {
  label?: string,
  type?: string,
  disabled?: boolean,
  onButtonClick?: () => mixed,
  [string]: mixed,
};
*/
export const EditorButton/*: Component<EditorButtonProps>*/ = ({
  label,
  onButtonClick,
  type = 'button',
  disabled,
  ...props
}) => {
  const onClick = () => {
    onButtonClick && onButtonClick();
  }
  return h('button', { ...props, disabled, type, onClick, classList: [styles.editorRoot] }, label);
}

/*::
export type FilesButtonEditorProps = {
  label?: string,
  multiple?: boolean,
  accept?: string,
  disabled?: boolean,
  onFilesChange?: File[] => mixed,
};
*/
export const FilesButtonEditor/*: Component<FilesButtonEditorProps>*/ = ({
  label,
  multiple,
  disabled,
  accept,
  onFilesChange,
}) => {
  const ref = useRef();
  const onChange = (event) => {
    onFilesChange && onFilesChange([...event.target.files]);
  };
  const onButtonClick = () => {
    const { current: input } = ref;
    if (!input)
      return;
    input.click();
  }
  return [
    h('input', { ref, style: { display: 'none' }, type: 'file', multiple, accept, onChange }),
    h(EditorButton, { disabled, label, onButtonClick })
  ]
}

/*::
export type EditorHorizontalSectionProps = {

};
*/

export const EditorHorizontalSection/*: Component<EditorHorizontalSectionProps>*/ = ({
  children,
}) => {
  return h('section', { classList: [styles.editorHorizontalSection]}, children)
}

/*::
export type EditorCheckboxInputProps = {
  label?: string,
  checked?: boolean,
  onCheckedChange?: boolean => mixed,
};
*/

export const EditorCheckboxInput/*: Component<EditorCheckboxInputProps>*/ = ({
  label,
  checked,
  onCheckedChange,
}) => {
  const onChange = (event) => {
    onCheckedChange && onCheckedChange(event.target.checked);
  }
  return [
    h('label', { classList: [styles.editorRoot] }, [
      h('span', {}, label),
      h('input', { type: 'checkbox', checked, onChange })
    ])
  ]
}