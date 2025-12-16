import {
    IAuthenticateGeneric,
    ICredentialDataDecryptedObject,
    ICredentialTestRequest,
    ICredentialType,
    IDataObject,
    IHttpRequestHelper,
    INodeProperties,
    Icon,
} from 'n8n-workflow';

export class ContractorsEsApi implements ICredentialType {
    name = 'contractorsEsApi';
    icon = 'file:../logo.svg' as Icon;
    displayName = 'Contractors.es API';
    documentationUrl = 'https://api.contractors.es/';
    properties: INodeProperties[] = [
        {
            displayName: 'Contractors.es URL',
            name: 'url',
            placeholder: "https://XXX.contractors.es",
            type: 'string',
            default: '',
            required: true,
        },
        {
            displayName:
                "Use your Contractors.es installation URL and login credentials.",
            default: '',
            name: 'operation',
            type: 'notice',
        },
        {
            displayName: 'Login',
            name: 'login',
            type: 'string',
            placeholder: "your-login",
            default: '',
            required: true,
        },
        {
            displayName: 'Password',
            name: 'password',
            type: 'string',
            placeholder: "your-password",
            default: '',
            required: true,
            typeOptions: { password: true },
        },
        {
            displayName: 'Access Token',
            name: 'accessToken',
            type: 'hidden',
            typeOptions: {
                expirable: true,
            },
            default: '',
            required: false,
        },
    ];

    preAuthentication = async function (this: IHttpRequestHelper, credentials: ICredentialDataDecryptedObject): Promise<IDataObject> {
        const url = (credentials.url as string).trim().replace(/\/+$/g, '');
        credentials.url = url;

        const response = await this.helpers.httpRequest({
            method: 'POST',
            url: `${url}/api/auth/login`,
            body: {
                username: credentials.login,
                password: credentials.password,
                useragent: 'n8n',
            },
        }) as IDataObject;

        const accessToken = (response?.token as IDataObject | undefined)?.access_token as string | undefined
            ?? (response?.token as IDataObject | undefined)?.accessToken as string | undefined;

        if (!accessToken) {
            throw new Error('Authentication failed: No access token returned');
        }

        return { accessToken };
    };

    authenticate: IAuthenticateGeneric = {
        type: 'generic',
        properties: {
            headers: {
                'Authorization': '=Bearer {{$credentials.accessToken}}',
            },
        },
    };

    test: ICredentialTestRequest = {
        request: {
            baseURL: '={{$credentials.url}}',
            url: '/',
        },
    };

}
