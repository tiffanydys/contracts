import { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
import { Context } from '../types/Context';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type FieldWrapper<T> = T;
export type RequireFields<T, K extends keyof T> = { [X in Exclude<keyof T, K>]?: T[X] } & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  /** A date-time string at UTC, such as 2007-12-03T10:15:30Z, compliant with the 'date-time' format outlined in section 5.6 of the RFC 3339 profile of the ISO 8601 standard for representation of dates and times using the Gregorian calendar. */
  DateTime: any;
};

export type Event = PlantAction;

export type Farm = {
  __typename?: 'Farm';
  fields: Array<FieldWrapper<Field>>;
  id: FieldWrapper<Scalars['ID']>;
};

export type Field = {
  __typename?: 'Field';
  index: FieldWrapper<Scalars['Int']>;
  plant: FieldWrapper<Plant>;
  plantedAt: FieldWrapper<Scalars['DateTime']>;
};

/** MutationType */
export type Mutation = {
  __typename?: 'Mutation';
  save?: Maybe<FieldWrapper<Farm>>;
};


/** MutationType */
export type MutationSaveArgs = {
  events?: InputMaybe<Array<Event>>;
};

export enum Plant {
  Potato = 'potato',
  Sunflower = 'sunflower'
}

export type PlantAction = {
  __typename?: 'PlantAction';
  field: FieldWrapper<Scalars['Int']>;
  plant: FieldWrapper<Plant>;
  plantedAt: FieldWrapper<Scalars['DateTime']>;
};

/** QueryType */
export type Query = {
  __typename?: 'Query';
  farm?: Maybe<FieldWrapper<Farm>>;
};


/** QueryType */
export type QueryFarmArgs = {
  id: Scalars['ID'];
};

export type SaveInput = {
  events: Array<Event>;
};

export type WithIndex<TObject> = TObject & Record<string, any>;
export type ResolversObject<TObject> = WithIndex<TObject>;

export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = ResolversObject<{
  Boolean: ResolverTypeWrapper<Partial<Scalars['Boolean']>>;
  DateTime: ResolverTypeWrapper<Partial<Scalars['DateTime']>>;
  Event: Partial<ResolversTypes['PlantAction']>;
  Farm: ResolverTypeWrapper<Partial<Farm>>;
  Field: ResolverTypeWrapper<Partial<Field>>;
  ID: ResolverTypeWrapper<Partial<Scalars['ID']>>;
  Int: ResolverTypeWrapper<Partial<Scalars['Int']>>;
  Mutation: ResolverTypeWrapper<{}>;
  Plant: ResolverTypeWrapper<Partial<Plant>>;
  PlantAction: ResolverTypeWrapper<Partial<PlantAction>>;
  Query: ResolverTypeWrapper<{}>;
  SaveInput: ResolverTypeWrapper<Partial<SaveInput>>;
  String: ResolverTypeWrapper<Partial<Scalars['String']>>;
}>;

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = ResolversObject<{
  Boolean: Partial<Scalars['Boolean']>;
  DateTime: Partial<Scalars['DateTime']>;
  Event: Partial<ResolversParentTypes['PlantAction']>;
  Farm: Partial<Farm>;
  Field: Partial<Field>;
  ID: Partial<Scalars['ID']>;
  Int: Partial<Scalars['Int']>;
  Mutation: {};
  PlantAction: Partial<PlantAction>;
  Query: {};
  SaveInput: Partial<SaveInput>;
  String: Partial<Scalars['String']>;
}>;

export interface DateTimeScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['DateTime'], any> {
  name: 'DateTime';
}

export type EventResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Event'] = ResolversParentTypes['Event']> = ResolversObject<{
  __resolveType: TypeResolveFn<'PlantAction', ParentType, ContextType>;
}>;

export type FarmResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Farm'] = ResolversParentTypes['Farm']> = ResolversObject<{
  fields?: Resolver<Array<ResolversTypes['Field']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type FieldResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Field'] = ResolversParentTypes['Field']> = ResolversObject<{
  index?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  plant?: Resolver<ResolversTypes['Plant'], ParentType, ContextType>;
  plantedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type MutationResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = ResolversObject<{
  save?: Resolver<Maybe<ResolversTypes['Farm']>, ParentType, ContextType, RequireFields<MutationSaveArgs, never>>;
}>;

export type PlantActionResolvers<ContextType = Context, ParentType extends ResolversParentTypes['PlantAction'] = ResolversParentTypes['PlantAction']> = ResolversObject<{
  field?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  plant?: Resolver<ResolversTypes['Plant'], ParentType, ContextType>;
  plantedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type QueryResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = ResolversObject<{
  farm?: Resolver<Maybe<ResolversTypes['Farm']>, ParentType, ContextType, RequireFields<QueryFarmArgs, 'id'>>;
}>;

export type Resolvers<ContextType = Context> = ResolversObject<{
  DateTime?: GraphQLScalarType;
  Event?: EventResolvers<ContextType>;
  Farm?: FarmResolvers<ContextType>;
  Field?: FieldResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  PlantAction?: PlantActionResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
}>;

