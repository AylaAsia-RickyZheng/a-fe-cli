export {}
declare global {
  namespace G {
    type ListItemType = {
      des: string,
      git: string,
      version: string,
      class: string
    }
  
    type ClassDictItemType = {
      class: string,
      des: string
    }
    
    type ConfigType = {
      list: ListItemType[],
      classDict: ClassDictItemType[]
    }
  }
}