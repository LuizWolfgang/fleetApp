import { reverseGeocodeAsync, LocationObjectCoords } from 'expo-location'

//traz os dados do endereço, como rua, estado, regiao
export async function getAddressLocation({ latitude, longitude }: LocationObjectCoords) {
  try {
    const addressResponse = await reverseGeocodeAsync({ latitude, longitude })
    return addressResponse[0]?.street
  } catch (error) {
    console.log(error)
  }
}