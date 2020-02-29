import React from "react"
import { FormikErrors, FormikTouched, FormikValues } from "formik"
import * as Yup from "yup"

// Formik does not provide an interface for the return type of useFormik, so
// we need to create our own, with only the fields we need.
// More context available here:
// https://github.com/jaredpalmer/formik/issues/2023#issuecomment-564300877
interface FormikForm<T extends FormikValues> {
  values: T
  errors: FormikErrors<T>
  touched: FormikTouched<T>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handleBlur: (eventOrString: any) => void | ((e: any) => void)
  handleChange: (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    eventOrPath: string | React.ChangeEvent<any>,
  ) => // eslint-disable-next-line @typescript-eslint/no-explicit-any
  void | ((eventOrTextValue: string | React.ChangeEvent<any>) => void)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setFieldTouched: (field: keyof T, touched?: boolean, shouldValidate?: boolean) => any
}

/**
 * Make a set of props that work well with Formik forms and Material-UI form fields.
 */
export function makeFormFieldProps<T extends FormikValues>(name: keyof FormikForm<T>["values"], form: FormikForm<T>) {
  return {
    name,
    value: form.values[name],
    onChange: form.handleChange,
    // Only show error state if a form field has been touched
    error: form.touched[name] && !!form.errors[name],
    helperText: form.touched[name] ? form.errors[name] : undefined,
    // We don't use formik's handleBlur since it breaks Material UI's focus handling
    onBlur: () => form.setFieldTouched(name),
  }
}

/**
 * Converts uploaded file to hex or base64 string
 */
export function blobToString(blob: Blob, format: 'hex' | 'base64'): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        if (reader.result) {
          const str = Buffer.from(reader.result as string, 'binary').toString(format)
          resolve(str);
        } else {
          reject(new Error('File could not be read'));
        }
      });
      reader.readAsBinaryString(blob);
    } catch(err) {
      reject(err);
    }
  });
}
