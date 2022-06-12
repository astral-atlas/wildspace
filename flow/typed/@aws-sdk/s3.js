// @flow strict
// flow-typed signature: b2bfca5bb6a4ae509612fd0cc8819966
// flow-typed version: <<STUB>>/@aws-sdk/client-s3_v3.34.0/flow_v0.160.2

/**
 * This is an autogenerated libdef stub for:
 *
 *   '@aws-sdk/client-s3'
 *
 * Fill this stub out by replacing all the `any` types.
 *
 * Once filled out, we encourage you to share your work with the
 * community by sending a pull request to:
 * https://github.com/flowtype/flow-typed
 */

/*::

declare module '@aws-sdk/client-s3' {
  import type { Readable } from 'stream';
  
  declare export type PutObjectRequest = {
    Key?: string,
    Bucket?: string,

    CacheControl?: string,
    ContentDisposition?: string,
    ContentEncoding?: string,
    ContentLanguage?: string,
    ContentType?: string,
    ContentLength?: number,
    ContentMD5?: string,

    Expires?: Date,
    Metadata?: { [string]: string },
    Tagging?: string,
  }

  declare export type PutObjectCommandInput = {
    ...PutObjectRequest,
    Body?: Uint8Array | Buffer | string
  };
  declare export type PutObjectCommandOutput = {
    ETag: string,
    VersionId: string,
    Expiration: string,
  };

  declare export type GetObjectCommandInput = {
    Bucket: string,
    Key: string,
    VersionId?: string,
  };
  declare export type GetObjectCommandOutput = {
    Body: Readable,
    ContentType: string,
    ContentLength: string,
  };

  declare export type DeleteObjectCommandInput = {
    Bucket: string,
    Key: string,
    VersionId?: string,
  };

  declare export type DeleteObjectCommandOutput = {
    DeleteMarker: boolean,
  };
  declare interface ListObjectsInput {
    Bucket: string,
  }
  declare interface ListObjectsOutput {
    Contents: ({ Key: string })[],
  }
  declare interface HeadObjectInput {
    Bucket: string,
    Key: string,
  }
  declare interface HeadObjectOutput {
    ContentType: string,
  }
  declare interface CopyObjectInput {
    CopySource: string,
    Bucket: string,
    Key: string,
    ACL?: string,
  }
  declare interface CopyObjectOutput {
    
  }

  declare export class S3 {
    constructor(config: S3ClientConfig): S3,
    putObject(args: PutObjectCommandInput): Promise<PutObjectCommandOutput>,
    getObject(args: GetObjectCommandInput): Promise<GetObjectCommandOutput>,
    deleteObject(args: DeleteObjectCommandInput): Promise<DeleteObjectCommandOutput>,

    listObjectsV2(ListObjectsInput): Promise<ListObjectsOutput>,
    headObject(HeadObjectInput): Promise<HeadObjectOutput>,
    copyObject(CopyObjectInput): Promise<CopyObjectOutput>,
  }

  declare export class PutObjectCommand {
    constructor(input: PutObjectCommandInput): PutObjectCommand,
  }
  declare export class GetObjectCommand {
    constructor(input: GetObjectCommandInput): GetObjectCommand,
  }

  declare export type AWSClientSharedConfig = {
    region?: string,
  }

  declare export type S3ClientConfig = {
    ...AWSClientSharedConfig,
  }
}

*/