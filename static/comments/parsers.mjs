/**
 * @template T
 * @callback Parser
 * @param {unknown} input
 * @returns {{ success: true, value: T } | { success: false, error: string }}
 */

/**
 * @template T
 * @param {HTMLElement} element
 * @param {string} attribute
 * @param {Parser<T>} parser
 * @returns {T}
 */
export function attribute(element, attribute, parser) {
  if (element.hasAttribute(attribute)) {
    const value = element.getAttribute(attribute);
    const parsed = parser(value);
    if (parsed.success) {
      return parsed.value;
    } else {
      throw new TypeError(
        `expected attribute ${attribute} to be ${parsed.error}`,
      );
    }
  }
  throw new TypeError(`required attribute, ${attribute}, is missing`);
}

/**
 * @template T
 * @param {unknown} input
 * @param {string} property
 * @param {Parser<T>} parser
 * @returns {T}
 */
export function property(input, property, parser) {
  if (typeof input == "object" && input && property in input) {
    // @ts-ignore: this property access is safe
    const value = input[property];
    const parsed = parser(value);
    if (parsed.success) {
      return parsed.value;
    } else {
      throw new TypeError(
        `expected property ${property} to be ${parsed.error}`,
      );
    }
  }
  throw new TypeError(`required property, ${property}, is missing`);
}

/**
 * @template T
 * @param {Parser<T>} parser
 * @returns {Parser<T[]>}
 */
export function arrayOf(parser) {
  return (/** @type {unknown} */ value) => {
    if (Array.isArray(value)) {
      const parsed = value.map((v) => parser(v));
      const values = [];
      for (const result of parsed) {
        if (!result.success) {
          return result;
        } else {
          values.push(result.value);
        }
      }
      return { success: true, value: values };
    } else {
      return { success: false, error: "an array" };
    }
  };
}

/**
 * @type {Parser<Date>}
 */
export function date(value) {
  if (value && typeof value === "string") {
    const d = new Date(value);
    if (!isNaN(d)) {
      return { success: true, value: d };
    }
  } else if (value && value instanceof Date) {
    return { success: true, value };
  }
  return { success: false, error: "a date" };
}

/**
 * @template T
 * @param {new (input: unknown) => T} constructor
 * @returns {Parser<T>}
 */
export function klass(constructor) {
  return (input) => ({
    success: true,
    value: new constructor(input),
  });
}

/**
 * @type Parser<number>
 */
export function number(value) {
  if (typeof value === "number") {
    return { success: true, value };
  } else {
    return { success: false, error: "a number" };
  }
}

/** @type Parser<string> */
export function string(value) {
  if (value && typeof value === "string") {
    return { success: true, value };
  } else {
    return { success: false, error: "a string" };
  }
}

/**
 * @template T
 * @param {Parser<T>} parser
 * @returns {Parser<T | null>}
 */
export function nullable(parser) {
  return (/** @type {unknown} */ value) => {
    const parsed = parser(value);
    if (parsed.success) {
      return parsed;
    } else {
      return { success: true, value: null };
    }
  };
}
