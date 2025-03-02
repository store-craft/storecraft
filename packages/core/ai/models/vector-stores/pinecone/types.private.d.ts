
export type vector = {
  id: string,
  values: number[],
  metadata: Record<string, any>
}

type spec_serverless = {
  /** Configuration needed to deploy a serverless index. */
  serverless: {
    cloud: 'gcp',
    region: GCPRegion
  } | {
     cloud: 'aws', 
     region: AWSRegion
  } | {
    cloud: 'azure', 
    region: AzureRegion
  }
}

type spec_pod = {
  /** Configuration needed to deploy a pod-based index. */
  pod: {
    /** example "us-west1-gcp" */
    environment: `${GCPRegion}-gcp` | `${AWSRegion}-aws` | `${AzureRegion}-azure`,
    pod_type: `${'s1' | 'p1' | 'p2'}.${'x1' | 'x2' | 'x4' | 'x8'}`
  }
}

export type create_vector_index_params = {
  /** The name of the index. Resource name must be 1-45 characters long, start and end with an alphanumeric character, and consist only of lower case alphanumeric characters or '-'. */
  name: string;

  /** The spec object defines how the index should be deployed. For serverless indexes, you define only the cloud and region where the index should be hosted. For pod-based indexes, you define the environment where the index should be hosted, the pod type and size to use, and other index characteristics. */
  spec: spec_serverless | spec_pod,

  /** The dimensions of the vectors to be inserted in the index. */
  dimension: number,

  /** The distance metric to be used for similarity search. You can use 'euclidean', 'cosine', or 'dotproduct'. If the 'vector_type' is 'sparse', the metric must be 'dotproduct'. If the vector_type is dense, the metric defaults to 'cosine'. */
  metric: 'cosine' | 'euclidean' | 'dotproduct'

  /** Whether deletion protection is enabled/disabled for the index. */
  deletion_protection?: 'disabled' | 'enabled',

  /** Custom user tags added to an index. Keys must be 80 characters or less. Values must be 120 characters or less. Keys must be alphanumeric, '', or '-'. Values must be alphanumeric, ';', '@', '', '-', '.', '+', or ' '. To unset a key, set the value to be an empty string */
  tags?: object,

  /** The index vector type. You can use 'dense' or 'sparse'. If 'dense', the vector dimension must be specified. If 'sparse', the vector dimension should not be specified. */
  vector_type?: 'dense' | 'sparse'
}

export type create_vector_index_result = create_vector_index_params & {
  /** The URL address where the index is hosted */
  host: string,

  status: {
    ready: boolean,
    state: 'Initializing' | 'InitializationFailed' | 'ScalingUp' | 
      'ScalingDown' | 'ScalingUpPodSize' | 'ScalingDownPodSize' | 
      'Terminating' | 'Ready'
  }

}

export type upsert_vector_params = {
  vectors: vector[],
  namespace?: string
}

export type upsert_vector_response = {
  upsertedCount: number
}


export type query_vectors_params = {

  /** The number of results to return for each query. */
  topK: number, 

  /** The namespace to query */
  namespace?: string,

  /** The filter to apply. You can use vector metadata to limit your search. See Understanding metadata. You can use vector metadata to limit your search. See Understanding metadata. */
  filter?: object,

  /** Indicates whether vector values are included in the response. */
  includeValues?: boolean

  /** Indicates whether metadata is included in the response as well as the ids. */
  includeMetadata?: boolean

  /** The query vector. This should be the same length as the dimension of the index being queried. Each request can contain either the id or vector parameter. */
  vector?: number[]
  id?: string
}

/** The response for the query operation. These are the matches found for a particular query vector. The matches are ordered from most similar to least similar. */
export type query_vectors_result = {
  count: number,
  matches: (Partial<vector> & {
    score: number
  })[],
  namespace?: string,
  usage?: object
}


export type AWSRegion = 
  | "us-east-1"
  | "us-east-2"
  | "us-west-1"
  | "us-west-2"
  | "af-south-1"
  | "ap-east-1"
  | "ap-south-1"
  | "ap-south-2"
  | "ap-southeast-1"
  | "ap-southeast-2"
  | "ap-southeast-3"
  | "ap-northeast-1"
  | "ap-northeast-2"
  | "ap-northeast-3"
  | "ca-central-1"
  | "ca-west-1"
  | "eu-central-1"
  | "eu-central-2"
  | "eu-west-1"
  | "eu-west-2"
  | "eu-west-3"
  | "eu-north-1"
  | "eu-south-1"
  | "eu-south-2"
  | "me-central-1"
  | "me-south-1"
  | "sa-east-1"
  | "us-gov-east-1"
  | "us-gov-west-1"
  | "cn-north-1"
  | "cn-northwest-1";


export type GCPRegion =
  | 'us-central1'        // Iowa, USA
  | 'us-east1'           // South Carolina, USA
  | 'us-east4'           // Northern Virginia, USA
  | 'us-west1'           // Oregon, USA
  | 'us-west2'           // Los Angeles, California, USA
  | 'us-west3'           // Salt Lake City, Utah, USA
  | 'us-west4'           // Las Vegas, Nevada, USA
  | 'northamerica-northeast1' // Montréal, Canada
  | 'northamerica-northeast2' // Toronto, Canada
  | 'southamerica-east1' // São Paulo, Brazil
  | 'southamerica-west1' // Santiago, Chile
  | 'europe-west1'       // St. Ghislain, Belgium
  | 'europe-west2'       // London, UK
  | 'europe-west3'       // Frankfurt, Germany
  | 'europe-west4'       // Eemshaven, Netherlands
  | 'europe-west6'       // Zurich, Switzerland
  | 'europe-west8'       // Milan, Italy
  | 'europe-west9'       // Paris, France
  | 'europe-west12'      // Turin, Italy
  | 'europe-central2'    // Warsaw, Poland
  | 'europe-north1'      // Hamina, Finland
  | 'europe-southwest1'  // Madrid, Spain
  | 'me-west1'           // Tel Aviv, Israel
  | 'me-central1'        // Doha, Qatar
  | 'asia-south1'        // Mumbai, India
  | 'asia-south2'        // Delhi, India
  | 'asia-southeast1'    // Jurong West, Singapore
  | 'asia-southeast2'    // Jakarta, Indonesia
  | 'asia-east1'         // Changhua County, Taiwan
  | 'asia-east2'         // Hong Kong
  | 'asia-northeast1'    // Tokyo, Japan
  | 'asia-northeast2'    // Osaka, Japan
  | 'asia-northeast3'    // Seoul, South Korea
  | 'australia-southeast1' // Sydney, Australia
  | 'australia-southeast2' // Melbourne, Australia
  | 'africa-south1';     // Johannesburg, South Africa


export type AzureRegion =
| 'eastus'                   // East US
| 'eastus2'                  // East US 2
| 'centralus'                // Central US
| 'northcentralus'           // North Central US
| 'southcentralus'           // South Central US
| 'westus'                   // West US
| 'westus2'                  // West US 2
| 'westcentralus'            // West Central US
| 'canadacentral'            // Canada Central
| 'canadaeast'               // Canada East
| 'brazilsouth'              // Brazil South
| 'brazilse'                 // Brazil Southeast
| 'northeurope'              // North Europe
| 'westeurope'               // West Europe
| 'francecentral'            // France Central
| 'francesouth'              // France South
| 'germanywestcentral'       // Germany West Central
| 'germanynorth'             // Germany North
| 'norwayeast'               // Norway East
| 'norwaywest'               // Norway West
| 'switzerlandnorth'         // Switzerland North
| 'switzerlandwest'          // Switzerland West
| 'uksouth'                  // UK South
| 'ukwest'                   // UK West
| 'uaenorth'                 // UAE North
| 'uaecentral'               // UAE Central
| 'southafricanorth'         // South Africa North
| 'southafricawest'          // South Africa West
| 'australiaeast'            // Australia East
| 'australiasoutheast'       // Australia Southeast
| 'australiacentral'         // Australia Central
| 'australiacentral2'        // Australia Central 2
| 'eastasia'                 // East Asia
| 'southeastasia'            // Southeast Asia
| 'japaneast'                // Japan East
| 'japanwest'                // Japan West
| 'koreacentral'             // Korea Central
| 'koreasouth'               // Korea South
| 'indiacentral'             // Central India
| 'indiasouth'               // South India
| 'indiawest'                // West India
| 'chinanorth'               // China North
| 'chinaeast'                // China East
| 'chinanorth2'              // China North 2
| 'chinaeast2'               // China East 2
| 'chinanorth3'              // China North 3
| 'chinaeast3'               // China East 3
| 'germanycentral'           // Germany Central
| 'germanynortheast'         // Germany Northeast
| 'usgovvirginia'            // US Gov Virginia
| 'usgovarizona'             // US Gov Arizona
| 'usgovtexas'               // US Gov Texas
| 'usgoviowa'                // US Gov Iowa
| 'usdodeast'                // US DoD East
| 'usdodcentral';            // US DoD Central
