import fs from 'fs';
import path from 'path';
import cassandra from 'cassandra-driver';

const client = new cassandra.Client({
  contactPoints: ['127.0.0.1'],
  localDataCenter: 'datacenter1',
  keyspace: 'your_keyspace'
});

export async function GET(request, { params }) {
  const { templateId } = params;
  const flavor = request.nextUrl.searchParams.get('flavor') || 'root';

  try {
    const filePath = path.join(process.cwd(), 'data', 'templates.json');
    const fileContents = fs.readFileSync(filePath, 'utf-8');
    const templates = JSON.parse(fileContents);

    const template = templates[templateId];
    if (!template) {
      return new Response(JSON.stringify({ message: 'Template not found' }), { status: 404 });
    }

    // Fetch Cassandra records
    const cassQuery = `SELECT parent_name, child_name FROM milestones WHERE template_id = ? AND flavor_id = ?`;
    const result = await client.execute(cassQuery, [templateId, flavor]);

    const existingSet = new Set(result.rows.map(row => `${row.parent_name}__${row.child_name}`));

    const buildTemplateWithStatus = (sections) =>
      sections.map(section => ({
        parentName: section.parentName,
        childMilestones: section.childMilestones.map(m => ({
          name: m.name,
          status: existingSet.has(`${section.parentName}__${m.name}`) ? 'exists' : 'not_found'
        }))
      }));

    const rootTemplate = template.root ? buildTemplateWithStatus(template.root) : [];
    const flavorTemplate = flavor !== 'root' && template[flavor] ? buildTemplateWithStatus(template[flavor]) : [];

    return new Response(
      JSON.stringify({
        templateId,
        flavorId: flavor === 'root' ? null : flavor,
        rootTemplate,
        flavorTemplate
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('API error:', err);
    return new Response(JSON.stringify({ message: 'Server error' }), { status: 500 });
  }
}
