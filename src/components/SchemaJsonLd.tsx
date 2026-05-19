interface SchemaJsonLdProps {
  schema: Record<string, unknown>;
}

export function SchemaJsonLd({ schema }: SchemaJsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
