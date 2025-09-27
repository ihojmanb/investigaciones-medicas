create table patients (
  id uuid primary key default gen_random_uuid(),
  code text unique not null, -- anonymized patient code, or internal identifier
  name text, -- optional, since patients may share names
  created_at timestamptz default now()
);

create table trials (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  sponsor text, -- lab or company running it
  description text,
  created_at timestamptz default now()
);

create table patient_expenses (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid references patients(id) not null,
  trial_id uuid references trials(id) not null,
  visit_type text not null,
  visit_date date not null,
  created_at timestamptz default now()
);

create table expense_items (
  id uuid primary key default gen_random_uuid(),
  patient_expense_id uuid references patient_expenses(id) on delete cascade,
  type text not null, -- e.g. 'trip', 'ticket', 'food', 'accommodation'
  receipt_url text,
  cost numeric,
  created_at timestamptz default now()
);
