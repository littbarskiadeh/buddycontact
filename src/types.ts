export type Tag = {
  id: string;
  name: string;
};

export type Contact = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  notes: string | null;
  favorite: boolean;
  tags: Tag[];
  createdAt: string;
  updatedAt: string;
};

export type ContactFormValues = {
  name: string;
  email: string;
  phone: string;
  company: string;
  notes: string;
  favorite: boolean;
  tags: string;
};
