import { INodeType, INodeTypeDescription, NodeConnectionTypes } from 'n8n-workflow';
import { N8NPropertiesBuilder, N8NPropertiesBuilderConfig, Override } from '@devlikeapro/n8n-openapi-node';
import * as doc from './openapi.json';

const config: N8NPropertiesBuilderConfig = {}
const parser = new N8NPropertiesBuilder(doc, config);
const loginUrl = '/api/auth/login';

export const customDefaults: Override[] = [
    {
        // Make all PATCH params optional and drop empty payload fields
        find: {
            displayOptions: {
                show: {
                    // n8n stores the operation as "<VERB> <path>"
                    operation: [/^PATCH /],
                },
            },
        },
        replace: {
            required: false,
            type: 'json',
            default: null,
            routing: {
                send: {
                    // Omit only when value is truly absent/null; keep empty strings if user typed them
                    value: '={{ $value === null ? undefined : $value }}',
                },
            },
        },
    },
    {
        // Find field by fields matching
        find: {
            name: 'username',
            required: true,
            type: 'string',
            displayOptions: {
                show: {
                    operation: ["POST " + loginUrl],
                },
            },
        },
        // Replace 'default' field value
        replace: {
            default: '={{ $credentials.login }}',
        },
    },
    {
        find: {
            name: 'password',
            required: true,
            type: 'string',
            displayOptions: {
                show: {
                    operation: ["POST " + loginUrl],
                },
            },
        },
        replace: {
            "default": '={{ $credentials.password }}',
        },
    },
    {
        find: {
            name: 'useragent',
            required: false,
            type: 'string',
            displayOptions: {
                show: {
                    operation: ["POST " + loginUrl],
                },
            },
        },
        replace: {
            default: "n8n"
        },
    },
    {
        find: {
            name: 'with_trashed',
            type: 'boolean',
        },
        replace: {
            default: false,
        }
    },
    {
        find: {
            name: 'only_trashed',
            type: 'boolean',
        },
        replace: {
            default: false,
        },
    },
    {
        // Let includes be optional free-form JSON array instead of a forced single select
        find: {
            name: 'include',
            type: 'options',
        },
        replace: {
            required: false,
            type: 'multiOptions',
            default: [],
            routing: {
                send: {
                    property: 'include',
                    type: 'query',
                    propertyInDotNotation: false,
                    // join selected includes as comma-separated list; empty -> omit
                    value: '={{ Array.isArray($value) && $value.length ? $value.join(",") : undefined }}',
                },
            },
        },
    }
];

const properties = parser.build(customDefaults);

export class ContractorsEs implements INodeType {
    description: INodeTypeDescription = {
        displayName: 'Contractors.es',
        name: 'contractors-es',
        icon: 'file:logo.svg',
        group: ['transform'],
        version: 1,
        subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
        description: 'Interact with Contractors.es API',
        defaults: {
            name: 'Contractors.es',
        },
        usableAsTool: true,
        inputs: [NodeConnectionTypes.Main],
        outputs: [NodeConnectionTypes.Main],
        credentials: [
            {
                name: 'contractorsEsApi',
                required: true,
            },
        ],
        requestDefaults: {
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            baseURL: '={{$credentials.url}}',
        },
        properties: properties,
    };
}
