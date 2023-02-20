export interface IOneDriveItem {
  '@microsoft.graph.downloadUrl': string;
  description: string;
  id: string;
  image: { height: number; width: number };
  lastModifiedDateTime: string;
  file: {
    mimeType: string;
    hashes: {
      quickXorHash: string;
      sha1Hash: string;
      sha256Hash: string;
    };
  };
  name: string;
  photo: {
    takenDateTime: string;
  };
  size: number;
  webUrl: string;
}

export interface IOneDriveQueryResult {
  '@odata.count': number;
  '@odata.nextLink': string;
  value: IOneDriveItem[];
}

/*
Sample full record
 {
    "@microsoft.graph.downloadUrl": "https://public.bn.files.1drv.com/y4mcSVH22-ZwGzgO4GhFKwrEW55OrqUr4KsjJswf79mZIm7oGtTKSLQbCtzqQuRjtn28U09F1xNo3hyROvoC1Bd8ZGRyn7DKfbAh-dHg-Bg7LGkErTnghKi-UMzX7uqBy0mXgkM3qAhiyO9XoD0cgAcbsMTR8KLpMbH8YNiM_S4G2ANHyqmI-_Db8my8FaUpbke0XfHr87Uc_tVSPV02CPAJEbbgVpn5jvhd2naIwXT8Y4",
    "createdDateTime": "2020-04-25T21:45:49.967Z",
    "cTag": "aYzoyQTZEOENFRkIyM0ZBQzc2ITE1NDc4LjI1Nw",
    "description": "",
    "eTag": "aMkE2RDhDRUZCMjNGQUM3NiExNTQ3OC4xNQ",
    "id": "2A6D8CEFB23FAC76!15478",
    "lastModifiedDateTime": "2023-02-11T21:36:58.413Z",
    "name": "01DSC02891 - Copy.JPG",
    "size": 1307465,
    "webUrl": "https://1drv.ms/i/s!AHasP7LvjG0q-HY",
    "reactions": {
      "commentCount": 0
    },
    "createdBy": {
      "application": {
        "displayName": "MSOffice15",
        "id": "480728c5"
      },
      "device": {
        "id": "187ffe641b5998"
      },
      "user": {
        "displayName": "Jorge Gonzalez",
        "id": "2a6d8cefb23fac76"
      },
      "oneDriveSync": {
        "@odata.type": "#microsoft.graph.identity",
        "id": "0baf9d77-7ef7-420a-9547-7c66adf81005"
      }
    },
    "lastModifiedBy": {
      "user": {
        "displayName": "Jorge Gonzalez",
        "id": "2a6d8cefb23fac76"
      }
    },
    "parentReference": {
      "driveId": "2a6d8cefb23fac76",
      "driveType": "personal",
      "id": "2A6D8CEFB23FAC76!6916",
      "name": "Tata 2007",
      "path": "/drive/root:/Pictures/Pictures%20pre2017/2007/Tata%202007"
    },
    "file": {
      "mimeType": "image/jpeg",
      "hashes": {
        "quickXorHash": "j12jXhst6OhjVTKUo2iRC7B+qeM=",
        "sha1Hash": "9CF13DD16C95CF658B27E218EAA0F8B7CAA3FDE9",
        "sha256Hash": "5D7E315F36E34612EE189F70A28106CCFBFBCB38420398C1632950840E99BD7C"
      }
    },
    "fileSystemInfo": {
      "createdDateTime": "2020-04-24T18:26:44Z",
      "lastModifiedDateTime": "2007-01-05T01:53:42Z"
    },
    "image": {
      "height": 1360,
      "width": 2048
    },
    "photo": {
      "cameraMake": "SONY",
      "cameraModel": "CYBERSHOT",
      "exposureDenominator": 60,
      "exposureNumerator": 1,
      "focalLength": 9.2,
      "fNumber": 2.8,
      "iso": 135,
      "orientation": 1,
      "takenDateTime": "2007-01-04T20:53:43Z"
    },
    "shared": {
      "scope": "users",
      "owner": {
        "user": {
          "displayName": "Jorge Gonzalez",
          "id": "2a6d8cefb23fac76"
        }
      }
    }
  }
*/
