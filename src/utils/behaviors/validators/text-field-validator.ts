/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { Validator } from './validator.js'

/**
 * Constraint validation for a text field.
 */
export interface TextFieldState {
  /**
   * The input or textarea state to validate.
   */
  state: InputState | TextAreaState;

  /**
   * The `<input>` or `<textarea>` that is rendered on the page.
   *
   * `minlength` and `maxlength` validation do not apply until a user has
   * interacted with the control and the element is internally marked as dirty.
   * This is a spec quirk, the two properties behave differently from other
   * constraint validation.
   *
   * This means we need an actual rendered element instead of a virtual one,
   * since the virtual element will never be marked as dirty.
   *
   * This can be `null` if the element has not yet rendered, and the validator
   * will fall back to virtual elements for other constraint validation
   * properties, which do apply even if the control is not dirty.
   */
  renderedControl: HTMLInputElement | HTMLTextAreaElement | null;
}

/**
 * Constraint validation properties for an `<input>`.
 */
export interface InputState extends SharedInputAndTextAreaState {
  /**
   * The `<input>` type.
   *
   * Not all constraint validation properties apply to every type. See
   * https://developer.mozilla.org/en-US/docs/Web/HTML/Constraint_validation#validation-related_attributes
   * for which properties will apply to which types.
   */
  readonly type: string;

  /**
   * The regex pattern a value must match.
   */
  readonly pattern: string;

  /**
   * The minimum value.
   */
  readonly min: string;

  /**
   * The maximum value.
   */
  readonly max: string;

  /**
   * The step interval of the value.
   */
  readonly step: string;
}

/**
 * Constraint validation properties for a `<textarea>`.
 */
export interface TextAreaState extends SharedInputAndTextAreaState {
  /**
   * The type, must be "textarea" to inform the validator to use `<textarea>`
   * instead of `<input>`.
   */
  readonly type: 'textarea';
}

/**
 * Constraint validation properties shared between an `<input>` and
 * `<textarea>`.
 */
interface SharedInputAndTextAreaState {
  /**
   * The current value.
   */
  readonly value: string;

  /**
   * Whether the textarea is required.
   */
  readonly required: boolean;

  /**
   * The minimum length of the value.
   */
  readonly minLength: number;

  /**
   * The maximum length of the value.
   */
  readonly maxLength: number;
}

/**
 * A validator that provides constraint validation that emulates `<input>` and
 * `<textarea>` validation.
 */
export class TextFieldValidator extends Validator<TextFieldState> {
  private inputControl?: HTMLInputElement;
  private textAreaControl?: HTMLTextAreaElement;

  protected override computeValidity({state, renderedControl}: TextFieldState) {
    let inputOrTextArea = renderedControl;
    if (isInputState(state) && !inputOrTextArea) {
      // Get cached <input> or create it.
      inputOrTextArea = this.inputControl || document.createElement('input');
      // Cache the <input> to re-use it next time.
      this.inputControl = inputOrTextArea;
    } else if (!inputOrTextArea) {
      // Get cached <textarea> or create it.
      inputOrTextArea =
        this.textAreaControl || document.createElement('textarea');
      // Cache the <textarea> to re-use it next time.
      this.textAreaControl = inputOrTextArea;
    }

    // Set this variable so we can check it for input-specific properties.
    const input = isInputState(state)
      ? (inputOrTextArea as HTMLInputElement)
      : null;

    // Set input's "type" first, since this can change the other properties
    if (input) {
      input.type = state.type;
    }

    if (inputOrTextArea.value !== state.value) {
      // Only programmatically set the value if there's a difference. When using
      // the rendered control, the value will always be up to date. Setting the
      // property (even if it's the same string) will reset the internal <input>
      // dirty flag, making minlength and maxlength validation reset.
      inputOrTextArea.value = state.value;
    }

    inputOrTextArea.required = state.required;

    // The following IDLAttribute properties will always hydrate an attribute,
    // even if set to a the default value ('' or -1). The presence of the
    // attribute triggers constraint validation, so we must remove the attribute
    // when empty.
    if (input) {
      const inputState = state as InputState;
      if (inputState.pattern) {
        input.pattern = inputState.pattern;
      } else {
        input.removeAttribute('pattern');
      }

      if (inputState.min) {
        input.min = inputState.min;
      } else {
        input.removeAttribute('min');
      }

      if (inputState.max) {
        input.max = inputState.max;
      } else {
        input.removeAttribute('max');
      }

      if (inputState.step) {
        input.step = inputState.step;
      } else {
        input.removeAttribute('step');
      }
    }

    // Use -1 to represent no minlength and maxlength, which is what the
    // platform input returns. However, it will throw an error if you try to
    // manually set it to -1.
    //
    // While the type is `number`, it may actually be `null` at runtime.
    // `null > -1` is true since `null` coerces to `0`, so we default null and
    // undefined to -1.
    //
    // We set attributes instead of properties since setting a property may
    // throw an out of bounds error in relation to the other property.
    // Attributes will not throw errors while the state is updating.
    if ((state.minLength ?? -1) > -1) {
      inputOrTextArea.setAttribute('minlength', String(state.minLength));
    } else {
      inputOrTextArea.removeAttribute('minlength');
    }

    if ((state.maxLength ?? -1) > -1) {
      inputOrTextArea.setAttribute('maxlength', String(state.maxLength));
    } else {
      inputOrTextArea.removeAttribute('maxlength');
    }

    return {
      validity: inputOrTextArea.validity,
      validationMessage: inputOrTextArea.validationMessage,
    };
  }

  protected override equals(
    {state: prev}: TextFieldState,
    {state: next}: TextFieldState,
  ) {
    // Check shared input and textarea properties
    const inputOrTextAreaEqual =
      prev.type === next.type &&
      prev.value === next.value &&
      prev.required === next.required &&
      prev.minLength === next.minLength &&
      prev.maxLength === next.maxLength;

    if (!isInputState(prev) || !isInputState(next)) {
      // Both are textareas, all relevant properties are equal.
      return inputOrTextAreaEqual;
    }

    // Check additional input-specific properties.
    return (
      inputOrTextAreaEqual &&
      prev.pattern === next.pattern &&
      prev.min === next.min &&
      prev.max === next.max &&
      prev.step === next.step
    );
  }

  protected override copy({state}: TextFieldState): TextFieldState {
    // Don't hold a reference to the rendered control when copying since we
    // don't use it when checking if the state changed.
    return {
      state: isInputState(state)
        ? this.copyInput(state)
        : this.copyTextArea(state),
      renderedControl: null,
    };
  }

  private copyInput(state: InputState): InputState {
    const {type, pattern, min, max, step} = state;
    return {
      ...this.copySharedState(state),
      type,
      pattern,
      min,
      max,
      step,
    };
  }

  private copyTextArea(state: TextAreaState): TextAreaState {
    return {
      ...this.copySharedState(state),
      type: state.type,
    };
  }

  private copySharedState({
    value,
    required,
    minLength,
    maxLength,
  }: SharedInputAndTextAreaState): SharedInputAndTextAreaState {
    return {value, required, minLength, maxLength};
  }
}

function isInputState(state: InputState | TextAreaState): state is InputState {
  return state.type !== 'textarea';
}
