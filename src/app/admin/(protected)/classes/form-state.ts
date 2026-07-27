// Shared shape for the create/edit class form server-action state. Kept in a
// neutral module so both the "use server" actions and the "use client" form
// component can import it without crossing those boundaries.
export type ClassFormState = {
  error?: string;
  fieldErrors?: Record<string, string>;
  values?: Record<string, string>;
};

export type ClassFormValues = {
  title: string;
  category: string;
  description: string;
  term_id: string;
  location_id: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  grade_min: string;
  grade_max: string;
  price_dollars: string;
  capacity: string;
  is_published: boolean;
};

export const EMPTY_CLASS_VALUES: ClassFormValues = {
  title: "",
  category: "",
  description: "",
  term_id: "",
  location_id: "",
  day_of_week: "",
  start_time: "",
  end_time: "",
  grade_min: "0",
  grade_max: "8",
  price_dollars: "",
  capacity: "",
  is_published: false,
};
