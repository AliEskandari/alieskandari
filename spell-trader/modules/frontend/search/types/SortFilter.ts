export type SortFilter = {
  name: string;
  methods: {
    [key: string]: string;
  };
  type: string;
  value: string | undefined;
  // field: string | undefined;
  // operator: string | undefined;
  label: string | undefined;
};
