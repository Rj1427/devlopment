'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function TemplatePage({ params }) {
  const searchParams = useSearchParams();
  const flavor = searchParams.get('flavor');
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchTemplate = async () => {
      const res = await fetch(`/api/templates/${params.templateId}?flavor=${flavor || ''}`);
      const json = await res.json();
      setData(json);
    };

    fetchTemplate();
  }, [params.templateId, flavor]);

  if (!data) return <p>Loading...</p>;

  return (
    <div>
      <h1>Template {data.templateId}</h1>
      <h2>Root Template</h2>
      {data.rootTemplate.map((section, i) => (
        <div key={`root-${i}`}>
          <h3>{section.parentName}</h3>
          <ul>
            {section.childMilestones.map((m, j) => <li key={j}>{m.name}</li>)}
          </ul>
        </div>
      ))}

      {data.flavorId && (
        <>
          <h2>Flavor Template: {data.flavorId}</h2>
          {data.flavorTemplate.map((section, i) => (
            <div key={`flavor-${i}`}>
              <h3>{section.parentName}</h3>
              <ul>
                {section.childMilestones.map((m, j) => <li key={j}>{m.name}</li>)}
              </ul>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

import fs from 'fs';
import path from 'path';

export async function GET(request, { params }) {
  const { templateId } = params;
  const flavor = request.nextUrl.searchParams.get('flavor');

  try {
    const filePath = path.join(process.cwd(), 'data', 'templates.json');
    const file = fs.readFileSync(filePath, 'utf-8');
    const templates = JSON.parse(file);

    const template = templates[templateId];
    if (!template) {
      return new Response(JSON.stringify({ message: 'Template not found' }), { status: 404 });
    }

    const rootTemplate = template.root || [];
    const flavorTemplate = flavor && template[flavor] ? template[flavor] : [];

    return new Response(
      JSON.stringify({
        templateId,
        flavorId: flavor || null,
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

{
  "1": {
    "root": [
      {
        "parentName": "Planning",
        "childMilestones": [
          { "name": "Requirement Gathering" },
          { "name": "Timeline Estimation" }
        ]
      },
      {
        "parentName": "Execution",
        "childMilestones": [
          { "name": "Development" },
          { "name": "Code Review" }
        ]
      }
    ],
    "a": [
      {
        "parentName": "Execution",
        "childMilestones": [
          { "name": "Unit Testing" },
          { "name": "Integration Testing" }
        ]
      },
      {
        "parentName": "Deployment",
        "childMilestones": [
          { "name": "Staging" },
          { "name": "Production" }
        ]
      }
    ]
  }
}





