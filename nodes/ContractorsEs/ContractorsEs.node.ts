import { INodeType, INodeTypeDescription, NodeConnectionTypes } from 'n8n-workflow';
import { N8NPropertiesBuilder, N8NPropertiesBuilderConfig, Override } from '@devlikeapro/n8n-openapi-node';
import * as doc from './openapi.json';

const config: N8NPropertiesBuilderConfig = {}
const parser = new N8NPropertiesBuilder(doc, config);
const loginUrl = '/api/auth/login';

export const customDefaults: Override[] = [
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
];

const properties = parser.build(customDefaults);

export class ContractorsEs implements INodeType {
    description: INodeTypeDescription = {
        displayName: 'Contractors.es',
        name: 'contractors-es',
        icon: 'file:../../logo.svg',
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
