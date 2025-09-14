export function generateMockFromSchema(schema: any) {
  const out: any = {};
  const fields = (schema && schema.fields) || {};
  for (const [key, def] of Object.entries(fields)) {
    switch ((def as any).type) {
      case 'text':
        out[key] = 'Lorem ipsum';
        break;
      case 'richText':
        out[key] = [{ type: 'paragraph', text: 'Hello world' }];
        break;
      case 'image':
        out[key] = {
          url: 'https://picsum.photos/800/400',
          alt: 'placeholder',
        };
        break;
      case 'link':
        out[key] = { href: '#', label: 'Read more' };
        break;
      case 'repeat':
        const len = (def as any).min ?? 3;
        out[key] = Array.from({ length: len }).map((_, i) => ({
          label: `Item ${i + 1}`,
        }));
        break;
      default:
        out[key] = null;
    }
  }
  return out;
}
