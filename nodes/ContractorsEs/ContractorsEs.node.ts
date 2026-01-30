import { INodeType, INodeTypeDescription, NodeConnectionTypes } from 'n8n-workflow';
import { N8NPropertiesBuilder, N8NPropertiesBuilderConfig, Override } from '@devlikeapro/n8n-openapi-node';
import * as doc from './openapi.json';

const config: N8NPropertiesBuilderConfig = {}
const parser = new N8NPropertiesBuilder(doc, config);
const loginUrl = '/api/auth/login';

export const customDefaults: Override[] = [
    {
        // Make all PATCH params optional and drop empty payload fields
        find: (field: any) => {
            const ops = field?.displayOptions?.show?.operation;
            if (!Array.isArray(ops) || !ops.some((op: unknown) => typeof op === 'string' && /^patch /i.test(op))) {
                return false;
            }

            // Skip notices and path/query parameters; target only body payload fields
            if (field?.type === 'notice') {
                return false;
            }

            const send = field?.routing?.send;
            if (!send) {
                return false;
            }

            const sendType = (send as any).type;
            const isBody = sendType === undefined || sendType === null || sendType === 'body';
            if (!isBody) {
                return false;
            }

            // Mutate in place to keep existing routing.send.property/type
            field.required = false;
            // always offer DO_NOT_UPDATE sentinel
            const sentinel = 'DO_NOT_UPDATE';

            // handle booleans -> select with sentinel
            if (field.type === 'boolean') {
                field.type = 'options';
                field.options = [
                    { name: 'Checked', value: true },
                    { name: 'Not checked', value: false },
                    { name: sentinel, value: sentinel },
                ];
            }

            // handle options / multiOptions: add sentinel option
            if (field.type === 'options' || field.type === 'multiOptions') {
                const options = Array.isArray(field.options) ? field.options : [];
                const hasSentinel = options.some((o: any) => o?.value === sentinel);
                if (!hasSentinel) {
                    options.push({ name: sentinel, value: sentinel });
                }
                field.options = options;
            }

            // handle numbers -> treat as string
            if (field.type === 'number' || field.type === 'integer') {
                field.type = 'string';
            }

            // always set default sentinel
            field.default = sentinel;

            let oldSendValue = field.routing.send.value;
            if (typeof oldSendValue === 'string') {
                oldSendValue = oldSendValue.replace(/^\s*\=\{\{/, '');
                oldSendValue = oldSendValue.replace(/\}\}\s*$/, '');
            } else {
                oldSendValue = '$value';
            }

            field.routing.send = {
                ...field.routing.send,
                // omit when sentinel appears (works for single, multi, object/array via JSON check)
                value: '={{ const v = (typeof $value === "string" ? $value : JSON.stringify($value)); v.includes("DO_NOT_UPDATE") ? undefined : ' + oldSendValue + ' }}'
            };
            return false; // already updated, skip replace
        },
        replace: {},
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
            default: '={{ $credentials.password }}',
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
            baseURL: '={{$credentials.url}}'
        },
        properties: properties,
    };
}
