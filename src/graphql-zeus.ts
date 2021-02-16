type Opaque<Type, Token = unknown> = Type & { readonly __opaque__: Token };
/* tslint:disable */
/* eslint-disable */

export type ValueTypes = {
    ["QueryRoot"]: AliasType<{
	rooms?:ValueTypes["RoomObject"],
room?: [{	id:ValueTypes["RoomId"]},ValueTypes["RoomObject"]],
		__typename?: true
}>;
	["RoomObject"]: AliasType<{
	id?:true,
tickets?: [{	secret:ValueTypes["Secret"]},ValueTypes["TicketObject"]],
ticket?: [{	id:ValueTypes["TicketId"]},ValueTypes["TicketObject"]],
isSecret?: [{	secret?:ValueTypes["Secret"]},true],
	isOpen?:true,
		__typename?: true
}>;
	["RoomId"]:unknown;
	["Secret"]:unknown;
	["TicketObject"]: AliasType<{
	id?:true,
	body?:true,
	status?:ValueTypes["TicketStatus"],
		__typename?: true
}>;
	["TicketId"]:unknown;
	["TicketStatus"]: AliasType<{
	position?:true,
	isBeingHelped?:true,
	isInQueue?:true,
		__typename?: true
}>;
	["MutationRoot"]: AliasType<{
	createRoom?:ValueTypes["CreateRoomResponse"],
enterQueue?: [{	roomId:ValueTypes["RoomId"],	body:string},ValueTypes["TicketObject"]],
leaveQueue?: [{	roomId:ValueTypes["RoomId"],	ticketId:ValueTypes["TicketId"]},true],
setHelp?: [{	roomId:ValueTypes["RoomId"],	ticketId:ValueTypes["TicketId"],	secret:ValueTypes["Secret"],	help:boolean},true],
setOpen?: [{	roomId:ValueTypes["RoomId"],	secret:ValueTypes["Secret"],	open:boolean},true],
		__typename?: true
}>;
	["CreateRoomResponse"]: AliasType<{
	roomId?:true,
	secret?:true,
		__typename?: true
}>
  }

export type PartialObjects = {
    ["QueryRoot"]: {
		__typename?: "QueryRoot";
			rooms?:PartialObjects["RoomObject"][],
			room?:PartialObjects["RoomObject"]
	},
	["RoomObject"]: {
		__typename?: "RoomObject";
			id?:PartialObjects["RoomId"],
			tickets?:PartialObjects["TicketObject"][],
			ticket?:PartialObjects["TicketObject"],
			isSecret?:boolean,
			isOpen?:boolean
	},
	["RoomId"]:any,
	["Secret"]:any,
	["TicketObject"]: {
		__typename?: "TicketObject";
			id?:PartialObjects["TicketId"],
			body?:string,
			status?:PartialObjects["TicketStatus"]
	},
	["TicketId"]:any,
	["TicketStatus"]: {
		__typename?: "TicketStatus";
			position?:number,
			isBeingHelped?:boolean,
			isInQueue?:boolean
	},
	["MutationRoot"]: {
		__typename?: "MutationRoot";
			createRoom?:PartialObjects["CreateRoomResponse"],
			enterQueue?:PartialObjects["TicketObject"],
			leaveQueue?:boolean,
			setHelp?:boolean,
			setOpen?:boolean
	},
	["CreateRoomResponse"]: {
		__typename?: "CreateRoomResponse";
			roomId?:PartialObjects["RoomId"],
			secret?:PartialObjects["Secret"]
	}
  }

export type QueryRoot = {
	__typename?: "QueryRoot",
	rooms:RoomObject[],
	room?:RoomObject
}

export type RoomObject = {
	__typename?: "RoomObject",
	id:RoomId,
	tickets:TicketObject[],
	ticket?:TicketObject,
	isSecret:boolean,
	isOpen:boolean
}

export type RoomId = Opaque<string, "RoomId">

export type Secret = Opaque<string, "Secret">

export type TicketObject = {
	__typename?: "TicketObject",
	id:TicketId,
	body:string,
	status:TicketStatus
}

export type TicketId = Opaque<string, "TicketId">

export type TicketStatus = {
	__typename?: "TicketStatus",
	position?:number,
	isBeingHelped:boolean,
	isInQueue:boolean
}

export type MutationRoot = {
	__typename?: "MutationRoot",
	createRoom:CreateRoomResponse,
	enterQueue:TicketObject,
	leaveQueue:boolean,
	setHelp:boolean,
	setOpen:boolean
}

export type CreateRoomResponse = {
	__typename?: "CreateRoomResponse",
	roomId:RoomId,
	secret:Secret
}

export const AllTypesProps: Record<string,any> = {
	QueryRoot:{
		room:{
			id:{
				type:"RoomId",
				array:false,
				arrayRequired:false,
				required:true
			}
		}
	},
	RoomObject:{
		tickets:{
			secret:{
				type:"Secret",
				array:false,
				arrayRequired:false,
				required:true
			}
		},
		ticket:{
			id:{
				type:"TicketId",
				array:false,
				arrayRequired:false,
				required:true
			}
		},
		isSecret:{
			secret:{
				type:"Secret",
				array:false,
				arrayRequired:false,
				required:false
			}
		}
	},
	RoomId: "String",
	Secret: "String",
	TicketId: "String",
	MutationRoot:{
		enterQueue:{
			roomId:{
				type:"RoomId",
				array:false,
				arrayRequired:false,
				required:true
			},
			body:{
				type:"String",
				array:false,
				arrayRequired:false,
				required:true
			}
		},
		leaveQueue:{
			roomId:{
				type:"RoomId",
				array:false,
				arrayRequired:false,
				required:true
			},
			ticketId:{
				type:"TicketId",
				array:false,
				arrayRequired:false,
				required:true
			}
		},
		setHelp:{
			roomId:{
				type:"RoomId",
				array:false,
				arrayRequired:false,
				required:true
			},
			ticketId:{
				type:"TicketId",
				array:false,
				arrayRequired:false,
				required:true
			},
			secret:{
				type:"Secret",
				array:false,
				arrayRequired:false,
				required:true
			},
			help:{
				type:"Boolean",
				array:false,
				arrayRequired:false,
				required:true
			}
		},
		setOpen:{
			roomId:{
				type:"RoomId",
				array:false,
				arrayRequired:false,
				required:true
			},
			secret:{
				type:"Secret",
				array:false,
				arrayRequired:false,
				required:true
			},
			open:{
				type:"Boolean",
				array:false,
				arrayRequired:false,
				required:true
			}
		}
	}
}

export const ReturnTypes: Record<string,any> = {
	QueryRoot:{
		rooms:"RoomObject",
		room:"RoomObject"
	},
	RoomObject:{
		id:"RoomId",
		tickets:"TicketObject",
		ticket:"TicketObject",
		isSecret:"Boolean",
		isOpen:"Boolean"
	},
	TicketObject:{
		id:"TicketId",
		body:"String",
		status:"TicketStatus"
	},
	TicketStatus:{
		position:"Int",
		isBeingHelped:"Boolean",
		isInQueue:"Boolean"
	},
	MutationRoot:{
		createRoom:"CreateRoomResponse",
		enterQueue:"TicketObject",
		leaveQueue:"Boolean",
		setHelp:"Boolean",
		setOpen:"Boolean"
	},
	CreateRoomResponse:{
		roomId:"RoomId",
		secret:"Secret"
	}
}

export class GraphQLError extends Error {
    constructor(public response: GraphQLResponse) {
      super("");
      console.error(response);
    }
    toString() {
      return "GraphQL Response Error";
    }
  }



export type UnwrapPromise<T> = T extends Promise<infer R> ? R : T;
export type ZeusState<T extends (...args: any[]) => Promise<any>> = NonNullable<
  UnwrapPromise<ReturnType<T>>
>;
export type ZeusHook<
  T extends (
    ...args: any[]
  ) => Record<string, (...args: any[]) => Promise<any>>,
  N extends keyof ReturnType<T>
> = ZeusState<ReturnType<T>[N]>;

type Func<P extends any[], R> = (...args: P) => R;
type AnyFunc = Func<any, any>;

type WithTypeNameValue<T> = T & {
  __typename?: true;
};

type AliasType<T> = WithTypeNameValue<T> & {
  __alias?: Record<string, WithTypeNameValue<T>>;
};

type NotUndefined<T> = T extends undefined ? never : T;

export type ResolverType<F> = NotUndefined<F extends [infer ARGS, any] ? ARGS : undefined>;

export type ArgsType<F extends AnyFunc> = F extends Func<infer P, any> ? P : never;

interface GraphQLResponse {
  data?: Record<string, any>;
  errors?: Array<{
    message: string;
  }>;
}

export type ValuesOf<T> = T[keyof T];

export type MapResolve<SRC, DST> = SRC extends {
    __interface: infer INTERFACE;
    __resolve: Record<string, { __typename?: string }> & infer IMPLEMENTORS;
  }
  ?
  ValuesOf<{
    [k in (keyof SRC['__resolve'] & keyof DST)]: ({
      [rk in (keyof SRC['__resolve'][k] & keyof DST[k])]: LastMapTypeSRCResolver<SRC['__resolve'][k][rk], DST[k][rk]>
    } & {
      __typename: SRC['__resolve'][k]['__typename']
    })
  }>
  :
  never;

export type MapInterface<SRC, DST> = SRC extends {
    __interface: infer INTERFACE;
    __resolve: Record<string, { __typename?: string }> & infer IMPLEMENTORS;
  }
  ?
  (MapResolve<SRC, DST> extends never ? {} : MapResolve<SRC, DST>) & {
  [k in (keyof SRC['__interface'] & keyof DST)]: LastMapTypeSRCResolver<SRC['__interface'][k], DST[k]>
} : never;

export type ValueToUnion<T> = T extends {
  __typename: infer R;
}
  ? {
      [P in keyof Omit<T, '__typename'>]: T[P] & {
        __typename: R;
      };
    }
  : T;

export type ObjectToUnion<T> = {
  [P in keyof T]: T[P];
}[keyof T];

type Anify<T> = { [P in keyof T]?: any };


type LastMapTypeSRCResolver<SRC, DST> = SRC extends undefined
  ? undefined
  : SRC extends Array<infer AR>
  ? LastMapTypeSRCResolver<AR, DST>[]
  : SRC extends { __interface: any; __resolve: any }
  ? MapInterface<SRC, DST>
  : SRC extends { __union: any; __resolve: infer RESOLVE }
  ? ObjectToUnion<MapType<RESOLVE, ValueToUnion<DST>>>
  : DST extends boolean
  ? SRC
  : MapType<SRC, DST>;

export type MapType<SRC extends Anify<DST>, DST> = DST extends boolean
  ? SRC
  : DST extends {
      __alias: any;
    }
  ? {
      [A in keyof DST["__alias"]]: Required<SRC> extends Anify<
        DST["__alias"][A]
      >
        ? MapType<Required<SRC>, DST["__alias"][A]>
        : never;
    } &
      {
        [Key in keyof Omit<DST, "__alias">]: DST[Key] extends [
          any,
          infer PAYLOAD
        ]
          ? LastMapTypeSRCResolver<SRC[Key], PAYLOAD>
          : LastMapTypeSRCResolver<SRC[Key], DST[Key]>;
      }
  : {
      [Key in keyof DST]: DST[Key] extends [any, infer PAYLOAD]
        ? LastMapTypeSRCResolver<SRC[Key], PAYLOAD>
        : LastMapTypeSRCResolver<SRC[Key], DST[Key]>;
    };

type OperationToGraphQL<V, T> = <Z extends V>(o: Z | V, variables?: Record<string, any>) => Promise<MapType<T, Z>>;

type CastToGraphQL<V, T> = (
  resultOfYourQuery: any
) => <Z extends V>(o: Z | V) => MapType<T, Z>;

type fetchOptions = ArgsType<typeof fetch>;

export type SelectionFunction<V> = <T>(t: T | V) => T;
type FetchFunction = (query: string, variables?: Record<string, any>) => Promise<any>;



export const ZeusSelect = <T>() => ((t: any) => t) as SelectionFunction<T>;

export const ScalarResolver = (scalar: string, value: any) => {
  switch (scalar) {
    case 'String':
      return  `${JSON.stringify(value)}`;
    case 'Int':
      return `${value}`;
    case 'Float':
      return `${value}`;
    case 'Boolean':
      return `${value}`;
    case 'ID':
      return `"${value}"`;
    case 'enum':
      return `${value}`;
    case 'scalar':
      return `${value}`;
    default:
      return false;
  }
};


export const TypesPropsResolver = ({
    value,
    type,
    name,
    key,
    blockArrays
}: {
    value: any;
    type: string;
    name: string;
    key?: string;
    blockArrays?: boolean;
}): string => {
    if (value === null) {
        return `null`;
    }
    let resolvedValue = AllTypesProps[type][name];
    if (key) {
        resolvedValue = resolvedValue[key];
    }
    if (!resolvedValue) {
        throw new Error(`Cannot resolve ${type} ${name}${key ? ` ${key}` : ''}`)
    }
    const typeResolved = resolvedValue.type;
    const isArray = resolvedValue.array;
    const isArrayRequired = resolvedValue.arrayRequired;
    if (typeof value === 'string' && value.startsWith(`ZEUS_VAR$`)) {
        const isRequired = resolvedValue.required ? '!' : '';
        let t = `${typeResolved}`;
        if (isArray) {
          if (isRequired) {
              t = `${t}!`;
          }
          t = `[${t}]`;
          if(isArrayRequired){
            t = `${t}!`;
          }
        }else{
          if (isRequired) {
                t = `${t}!`;
          }
        }
        return `\$${value.split(`ZEUS_VAR$`)[1]}__ZEUS_VAR__${t}`;
    }
    if (isArray && !blockArrays) {
        return `[${value
        .map((v: any) => TypesPropsResolver({ value: v, type, name, key, blockArrays: true }))
        .join(',')}]`;
    }
    const reslovedScalar = ScalarResolver(typeResolved, value);
    if (!reslovedScalar) {
        const resolvedType = AllTypesProps[typeResolved];
        if (typeof resolvedType === 'object') {
        const argsKeys = Object.keys(resolvedType);
        return `{${argsKeys
            .filter((ak) => value[ak] !== undefined)
            .map(
            (ak) => `${ak}:${TypesPropsResolver({ value: value[ak], type: typeResolved, name: ak })}`
            )}}`;
        }
        return ScalarResolver(AllTypesProps[typeResolved], value) as string;
    }
    return reslovedScalar;
};


const isArrayFunction = (
  parent: string[],
  a: any[]
) => {
  const [values, r] = a;
  const [mainKey, key, ...keys] = parent;
  const keyValues = Object.keys(values).filter((k) => typeof values[k] !== 'undefined');

  if (!keys.length) {
      return keyValues.length > 0
        ? `(${keyValues
            .map(
              (v) =>
                `${v}:${TypesPropsResolver({
                  value: values[v],
                  type: mainKey,
                  name: key,
                  key: v
                })}`
            )
            .join(',')})${r ? traverseToSeekArrays(parent, r) : ''}`
        : traverseToSeekArrays(parent, r);
    }

  const [typeResolverKey] = keys.splice(keys.length - 1, 1);
  let valueToResolve = ReturnTypes[mainKey][key];
  for (const k of keys) {
    valueToResolve = ReturnTypes[valueToResolve][k];
  }

  const argumentString =
    keyValues.length > 0
      ? `(${keyValues
          .map(
            (v) =>
              `${v}:${TypesPropsResolver({
                value: values[v],
                type: valueToResolve,
                name: typeResolverKey,
                key: v
              })}`
          )
          .join(',')})${r ? traverseToSeekArrays(parent, r) : ''}`
      : traverseToSeekArrays(parent, r);
  return argumentString;
};


const resolveKV = (k: string, v: boolean | string | { [x: string]: boolean | string }) =>
  typeof v === 'boolean' ? k : typeof v === 'object' ? `${k}{${objectToTree(v)}}` : `${k}${v}`;


const objectToTree = (o: { [x: string]: boolean | string }): string =>
  `{${Object.keys(o).map((k) => `${resolveKV(k, o[k])}`).join(' ')}}`;


const traverseToSeekArrays = (parent: string[], a?: any): string => {
  if (!a) return '';
  if (Object.keys(a).length === 0) {
    return '';
  }
  let b: Record<string, any> = {};
  if (Array.isArray(a)) {
    return isArrayFunction([...parent], a);
  } else {
    if (typeof a === 'object') {
      Object.keys(a)
        .filter((k) => typeof a[k] !== 'undefined')
        .map((k) => {
        if (k === '__alias') {
          Object.keys(a[k]).map((aliasKey) => {
            const aliasOperations = a[k][aliasKey];
            const aliasOperationName = Object.keys(aliasOperations)[0];
            const aliasOperation = aliasOperations[aliasOperationName];
            b[
              `${aliasOperationName}__alias__${aliasKey}: ${aliasOperationName}`
            ] = traverseToSeekArrays([...parent, aliasOperationName], aliasOperation);
          });
        } else {
          b[k] = traverseToSeekArrays([...parent, k], a[k]);
        }
      });
    } else {
      return '';
    }
  }
  return objectToTree(b);
};  


const buildQuery = (type: string, a?: Record<any, any>) => 
  traverseToSeekArrays([type], a);


const inspectVariables = (query: string) => {
  const regex = /\$\b\w*__ZEUS_VAR__\[?[^!^\]^\s^,^\)^\}]*[!]?[\]]?[!]?/g;
  let result;
  const AllVariables: string[] = [];
  while ((result = regex.exec(query))) {
    if (AllVariables.includes(result[0])) {
      continue;
    }
    AllVariables.push(result[0]);
  }
  if (!AllVariables.length) {
    return query;
  }
  let filteredQuery = query;
  AllVariables.forEach((variable) => {
    while (filteredQuery.includes(variable)) {
      filteredQuery = filteredQuery.replace(variable, variable.split('__ZEUS_VAR__')[0]);
    }
  });
  return `(${AllVariables.map((a) => a.split('__ZEUS_VAR__'))
    .map(([variableName, variableType]) => `${variableName}:${variableType}`)
    .join(', ')})${filteredQuery}`;
};


const queryConstruct = (t: 'query' | 'mutation' | 'subscription', tName: string) => (o: Record<any, any>) =>
  `${t.toLowerCase()}${inspectVariables(buildQuery(tName, o))}`;
  

const fullChainConstruct = (fn: FetchFunction) => (t: 'query' | 'mutation' | 'subscription', tName: string) => (
  o: Record<any, any>,
  variables?: Record<string, any>,
) => fn(queryConstruct(t, tName)(o), variables).then((r:any) => { 
  seekForAliases(r)
  return r
});


const seekForAliases = (response: any) => {
  const traverseAlias = (value: any) => {
    if (Array.isArray(value)) {
      value.forEach(seekForAliases);
    } else {
      if (typeof value === 'object') {
        seekForAliases(value);
      }
    }
  };
  if (typeof response === 'object' && response) {
    const keys = Object.keys(response);
    if (keys.length < 1) {
      return;
    }
    keys.forEach((k) => {
      const value = response[k];
      if (k.indexOf('__alias__') !== -1) {
        const [operation, alias] = k.split('__alias__');
        response[alias] = {
          [operation]: value,
        };
        delete response[k];
      }
      traverseAlias(value);
    });
  }
};


export const $ = (t: TemplateStringsArray): any => `ZEUS_VAR$${t.join('')}`;


const handleFetchResponse = (
  response: Parameters<Extract<Parameters<ReturnType<typeof fetch>['then']>[0], Function>>[0]
): Promise<GraphQLResponse> => {
  if (!response.ok) {
    return new Promise((_, reject) => {
      response.text().then(text => {
        try { reject(JSON.parse(text)); }
        catch (err) { reject(text); }
      }).catch(reject);
    });
  }
  return response.json();
};

const apiFetch = (options: fetchOptions) => (query: string, variables: Record<string, any> = {}) => {
    let fetchFunction = fetch;
    let queryString = query;
    let fetchOptions = options[1] || {};
    if (fetchOptions.method && fetchOptions.method === 'GET') {
      queryString = encodeURIComponent(query);
      return fetchFunction(`${options[0]}?query=${queryString}`, fetchOptions)
        .then(handleFetchResponse)
        .then((response: GraphQLResponse) => {
          if (response.errors) {
            throw new GraphQLError(response);
          }
          return response.data;
        });
    }
    return fetchFunction(`${options[0]}`, {
      body: JSON.stringify({ query: queryString, variables }),
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      ...fetchOptions
    })
      .then(handleFetchResponse)
      .then((response: GraphQLResponse) => {
        if (response.errors) {
          throw new GraphQLError(response);
        }
        return response.data;
      });
  };
  


export const Thunder = (fn: FetchFunction) => ({
  query: ((o: any, variables) =>
    fullChainConstruct(fn)('query', 'QueryRoot')(o, variables).then(
      (response: any) => response
    )) as OperationToGraphQL<ValueTypes["QueryRoot"],QueryRoot>,
mutation: ((o: any, variables) =>
    fullChainConstruct(fn)('mutation', 'MutationRoot')(o, variables).then(
      (response: any) => response
    )) as OperationToGraphQL<ValueTypes["MutationRoot"],MutationRoot>
});

export const Chain = (...options: fetchOptions) => ({
  query: ((o: any, variables) =>
    fullChainConstruct(apiFetch(options))('query', 'QueryRoot')(o, variables).then(
      (response: any) => response
    )) as OperationToGraphQL<ValueTypes["QueryRoot"],QueryRoot>,
mutation: ((o: any, variables) =>
    fullChainConstruct(apiFetch(options))('mutation', 'MutationRoot')(o, variables).then(
      (response: any) => response
    )) as OperationToGraphQL<ValueTypes["MutationRoot"],MutationRoot>
});
export const Zeus = {
  query: (o:ValueTypes["QueryRoot"]) => queryConstruct('query', 'QueryRoot')(o),
mutation: (o:ValueTypes["MutationRoot"]) => queryConstruct('mutation', 'MutationRoot')(o)
};
export const Cast = {
  query: ((o: any) => (_: any) => o) as CastToGraphQL<
  ValueTypes["QueryRoot"],
  QueryRoot
>,
mutation: ((o: any) => (_: any) => o) as CastToGraphQL<
  ValueTypes["MutationRoot"],
  MutationRoot
>
};
export const Selectors = {
  query: ZeusSelect<ValueTypes["QueryRoot"]>(),
mutation: ZeusSelect<ValueTypes["MutationRoot"]>()
};
  