import { AiFillCloseCircle, AiOutlineLoading3Quarters, 
  AiOutlineCamera } from 'react-icons/ai'
import { BsClipboardPlus } from 'react-icons/bs'
import ImageEditor from './image-editor'
import { BsCloudUpload } from 'react-icons/bs'
import { useCallback, useEffect, useRef, 
  useState } from 'react'
import ShowIf from './show-if'
import { BlingInput } from './common-ui'
import { RiGalleryLine } from 'react-icons/ri'
import GallerySelect from '../apps/gallery/gallery-select'
import { DragDropContainer, DropTarget } from 'react-drag-drop-container'
import { hasTouchScreen, read_clipboard } from '../utils'
import { BlingButton } from './common-button'
import { HR } from './common-ui'
import Img from './img'
import { useStorecraft } from '@storecraft/sdk-react-hooks'
import { FieldLeafViewParams } from './fields-view'
import { ImpInterface } from './overlay'

/**
 * `CameraSource` will fetch image from local camera
 */
export type CameraSourceParams = {
  onFile: (value: FileList) => void;
  className: string;
};

/**
 * `LocalSource` will fetch image from a local device
 */
export type LocalSourceParams = {
  onFile: (value: FileList) => void;
  className: string;
};

/**
 * `GallerySource` will fetch file from the `images` database
 */
export type GallerySourceParams = {
  onFinish: (url: string, requires_edit?: boolean) => void;
  className: string;
};

/**
 * `UrlSource` will fetch image from a simple `url`
 */
export type UrlSourceParams = {
  onFinish: (url: string, requires_edit?: boolean) => void;
  className: string;
};

/**
 * `Media` wraps a few media fetching sources together.
 */
export type Upload = {
  status: "working" | "failed";
  id: string | number;
  preview: string;
  error_code?: string;
};

/**
 * `Media` wraps a few media fetching sources together.
 */
export type MediaParams = {
  className: string;
} & FieldLeafViewParams<string[]>;


/**
 * drop `event` type of `react-drag-drop-container` lib
 */
export type ReactDropEvent = {
  dragData: any;
  dropElem: React.ReactNode;
  dropData: any;
};

/**
 * drop `event` type of `react-drag-drop-container` lib
 */
export type BaseReactDragDropEvent = {
  dragData: any;
  dragElem: HTMLDivElement;
  containerElem: HTMLDivElement;
  sourceElem: HTMLSpanElement;
};

/**
 * `event` type of `react-drag-drop-container` lib
 */
export type DragLeaveEvent = BaseReactDragDropEvent;

/**
 * `event` type of `react-drag-drop-container` lib
 */
export type DragEnterEvent = BaseReactDragDropEvent;

/**
 * `Images` manages images thumbnails and uploads.
 */
export type ImagesParams = {
  urls: string[];
  uploads: Upload[];
  onImageClick: (ix: number) => void;
  onImageRemove: (ix: number) => void;
  onImageOrder: (ix: number, ij: number) => void;
} & React.ComponentProps<'div'>;


////

/**
 * `CameraSource` will fetch image from local camera
 */
const CameraSource = (
  {
    onFile, className, ...rest
  }: CameraSourceParams
) => {

  const [isOver, setIsOver] = useState(false);
  const [files, setFiles] = useState<FileList>();

  const _notify = useCallback(
    (fs: FileList) => {
      setIsOver(false)
      setFiles(fs)
      onFile(fs)
    }, [onFile]
  )
  const onFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      e.preventDefault()
      _notify(e.currentTarget.files)
    }, [_notify]
  )
  
  const cls_color = isOver ? 'border-teal-600' : 'border-gray-300 '

  return (
<label 
    className={`flex flex-col justify-center items-center p-2
              rounded-lg border-4 border-dashed cursor-pointer
              shelf-media-source ${cls_color} ${className}`}>
  <div className="flex flex-col justify-center items-center">
    <AiOutlineCamera className='w-10 h-10 text-gray-500 dark:text-gray-400' />
    <p className='text-lg text-gray-500 mt-0 font-thin'
       children='Camera' />
  </div>
  <input 
      type='file' 
      className='hidden'
      capture accept='image/*'
      onChange={onFileSelect} />
</label>
  )
}

/**
 * `LocalSource` will fetch image from a local device
 */
const LocalSource = (
  {
    onFile, className, ...rest
  }: LocalSourceParams
) => {

  const [_hasTouchScreen, setHasTouchScreen] = useState(false)
  const [isOver, setIsOver] = useState(false)
  const [files, setFiles] = useState<FileList>()

  useEffect(
    () => {
      setHasTouchScreen(hasTouchScreen())
    }, []
  )
  const _notify = useCallback(
    (fs: FileList) => {
      setIsOver(false)
      setFiles(fs)
      // onFile(URL.createObjectURL(fs[0]))
      onFile(fs)
    }, [onFile]
  )
  const onDrop = useCallback(
    (e: React.DragEvent<HTMLLabelElement>) => {
      e.preventDefault();
      _notify(e.dataTransfer.files)
    }, [_notify]
  );

  const onFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      e.preventDefault()
      _notify(e.currentTarget.files)
    }, [_notify]
  );

  const onDragEnter = useCallback(
    (e: React.DragEvent<HTMLLabelElement>) => {
      e.preventDefault();
    }, []
  );

  const onDragLeave = useCallback(
    (e: React.DragEvent<HTMLLabelElement>) => {
      e.preventDefault();
      setIsOver(false)
    }, []
  );
  
  const onDragOver = useCallback(
    (e: React.DragEvent<HTMLLabelElement>) => {
      e.preventDefault()
      setIsOver(true)
    }, []
  );

  const cls_color = isOver ? 'border-teal-600' : 'border-gray-300 '

  return (
<label 
    onDrop={onDrop} 
    onDragEnter={onDragEnter} 
    onDragOver={onDragOver}
    onDragLeave={onDragLeave}
    htmlFor="dropzone-file" 
    className={`flex flex-col justify-center items-center p-2
                shelf-media-source
                border-4 border-dashed cursor-pointer rounded-lg 
                ${cls_color} ${className}`}>
  <div className="flex flex-col justify-center items-center
                  text-gray-500 dark:text-gray-400">
    <BsCloudUpload className='w-10 h-10 text-gray-400' />
    <p className='text-lg --text-gray-500 --mt-3 font-light' 
       children='browse local'/>
    <ShowIf show={!_hasTouchScreen}>
      <p className='text-xs --text-gray-500' 
         children='or'/>
      <p className='text-sm --text-gray-500 font-semibold' 
         children='DRAG & DROP' />
    </ShowIf>
  </div>
  <input 
    id="dropzone-file" 
    type="file" 
    className="hidden" 
    accept="image/*" 
    multiple 
    onChange={onFileSelect} />
</label>
  )
}

/**
 * `GallerySource` will fetch file from the `images` database
 */
const GallerySource = (
  {
    onFinish, className, ...rest
  }: GallerySourceParams
) => {

  const ref_gallery = useRef<ImpInterface>(undefined);

  return (
<>
  <label onClick={() => ref_gallery.current.show()}
      className={`flex flex-col justify-center items-center p-2
                  shelf-media-source rounded-lg 
                  border-4 border-dashed cursor-pointer
                  border-gray-300
                  ${className}`} {...rest}>
    <div className='flex flex-col justify-center items-center'>
      <RiGalleryLine className='w-10 h-10 text-gray-400 stroke-red-400' />
      <p className='text-lg text-gray-500 dark:text-gray-400 font-thin'
         children='browse' />
      <p className='text-xl text-gray-400 font-semibold' 
         children='Gallery' />
    </div>
  </label>
  <GallerySelect 
      key='gallery' 
      ref={ref_gallery} 
      onSelect={img => onFinish(img.url)}  />
</>    
  )
}


const test_url = 'https://images-na.ssl-images-amazon.com/images/I/91iHBLGTsIL._SL1500_.jpg'

/**
 * `UrlSource` will fetch image from a simple `url`
 */
const UrlSource = (
  {
    onFinish, className, ...rest
  }: UrlSourceParams
) => {

  const [edit, setEdit] = useState(false)
  const [url, setUrl] = useState<string>()
  const [error, setError] = useState<string>(undefined)

  const onAdd = useCallback(
    ($url: string) => {
      if($url===undefined)
        return
      let regEx = /\b(https?:\/\/.*?\.[a-z]{2,4}\/[^\s]*\b)/g;
      setError(undefined)
      if($url.match(regEx)) {
        onFinish($url, edit)
      } else {
        setError('Bad URL')
      }
    }, [edit, onFinish]
  );

  const onFromClipboard = useCallback(
    async () => {
      const text = await read_clipboard()
      if(text===undefined)
        return

      setUrl(text)
      onAdd(text)
    }, [onAdd]
  );

  return (
<div className={`p-3 --h-32 shelf-text-minor
                text-xs font-semibold 
                border-gray-300
                rounded-lg shelf-media-source
                border-4 border-dashed cursor-pointer 
                ${className}`}>
  <div className="flex flex-col justify-start items-center ">
    <div className='flex flex-row justify-between items-center w-full mb-3'>
      <BlingButton 
        children='from url' 
        className='w-fit h-9' 
        onClick={_ => onAdd(url)}/>

      <BsClipboardPlus 
        className='text-2xl text-kf-400' 
        onClick={onFromClipboard} />
      <label htmlFor='cb_url' className='flex flex-row items-center'>
        <span children='edit' className='text-center align-middle'/>
        <input 
          id='cb_url' type='checkbox' 
          className='ml-1 accent-pink-500 w-4 h-4
                    bg-white dark:bg-slate-600' 
          onChange={e => setEdit(e.currentTarget.checked)}/>
      </label>
    </div>
    <p children={error ?? ''} className='text-red-600' />
    <BlingInput 
      className='mt-1 w-full' 
      placeholder='from URL..' 
      type='text' 
      value={url} 
      onChange={e => setUrl(e.currentTarget.value)}
    />
  </div>
</div>

  )
}


const URLS = [
  // 'https://images-na.ssl-images-amazon.com/images/I/91iHBLGTsIL._SL1500_.jpg',
  // 'https://vgs.co.il/wp-content/uploads/2017/01/The-Legend-of-Zelda-Breath-of-the-Wild-Nintendo-Switch.jpg'
]

/**
 * `Media` wraps a few media fetching sources together.
 */
const Media = (
  {
    field, value = [], onChange, className, ...rest
  }: MediaParams
) => {

  const { sdk } = useStorecraft();
  const [_hasTouchScreen, setHasTouchScreen] = useState(false);
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [urls, setUrls] = useState(value ?? []);
  
  // crop
  const [editSrc, setEditSrc] = useState<string>()
  const [editSrcName, setEditSrcName] = useState('')

  // This effect will notify the edit node each time urls change
  // useEffect(
  //   () => { 
  //     onChange && onChange(urls);
  //   }, 
  //   [urls, onChange]
  // )

  useEffect(
    () => {
      setHasTouchScreen(hasTouchScreen())
    }, []
  );

  //
  const setEditSourceWithRevoke = useCallback(
    (src: string, name?: string) => {
      // src can be url, blob, data-url
      setEditSrc(current => {
        try { // if the current is an object url, try to free it
          URL.revokeObjectURL(current)
        } catch {}
        return src
      })
      setEditSrcName(name)
    }, []
  );

  // Sources handlers
  const onFileSource: CameraSourceParams["onFile"] = useCallback(
    (files) => {
      // need to store it for memory release revokeObjectURL(objectURL)
      const obj_url = URL.createObjectURL(files[0])
      setEditSourceWithRevoke(obj_url, files[0].name)
    }, [setEditSourceWithRevoke]
  )

  const onUrlSource: UrlSourceParams["onFinish"] = useCallback(
    (img_url, requires_edit=false) => {
      if(requires_edit){
        setEditSourceWithRevoke(img_url, img_url)
      }
      else {
        const us = [img_url, ...urls];
        setUrls(us)
        onChange && onChange(us)
      }
    }, [setEditSourceWithRevoke, urls, onChange]
  )

  // Editing is complete
  const onCompleteEditing = useCallback(
    async (
      blob: Blob, type: 'jpeg' | 'png' | 'webp', 
      name: string, width: number, height: number
    ) => {
      // upload indication
      setEditSourceWithRevoke(undefined)
      if(blob==undefined)
        return;
        
      const obj_url = URL.createObjectURL(blob)
      const id = Date.now();
      setUploads(
        us => [
          { status: 'working', id, preview: obj_url}, 
          ...us
        ]
      );

      // name    
      name = decodeURIComponent(name.toString()).split('/').pop();

      if(name.includes('.'))
        name = name.split('.').slice(0, -1).join('.');

      name = `${name}_${Date.now()}_w_${width}_h_${height}.${type}`

      // upload here
      try {
        const key = `images/${name}`;
        const ok = await sdk.storage.putBytes(
          key, blob
        );

        if(!ok) throw 'wow';

        const url = `storage://${key}`
        const us = [url, ...urls]                        ;

        setUrls(us);
        onChange && onChange(us);

        setUploads(ups => ups.filter(up => up.id!==id));
        URL.revokeObjectURL(obj_url);
        
      } catch (err) {
        console.log(err);
        setUploads(
          ups => {
            let me = ups.find(up => up.id===id);

            me.status = 'failed'
            me.error_code = err.code

            return [...ups]
          }
        );
      }

    }, [setEditSourceWithRevoke, urls, onChange]
  );

  // Images callbacks
  const onImageRemove = useCallback(
    (ix: number) => {
      console.log(ix, urls)
      const new_urls = [...urls]
      new_urls.splice(ix, 1)
      setUrls(new_urls);
      onChange && onChange(new_urls);
    }, [urls, onChange]
  );

  const onImageClick = useCallback(
    (ix: number) => {
      setEditSourceWithRevoke(urls[ix], urls[ix])
    }, [urls, setEditSourceWithRevoke]
  );

  const onImageOrder = useCallback(
    (ix: number, jx: number) => {
      console.log(ix, '-', jx)
      const urls_c = [...urls]
      const temp = urls_c[jx]
      urls_c[jx] = urls_c[ix]
      urls_c[ix] = temp
      setUrls(urls_c);
      onChange && onChange(urls_c);
    }, [urls, onChange]
  );

  return (
<div className={className} >
  <div className='w-full flex flex-row flex-wrap gap-3'>
  
    {
      _hasTouchScreen &&
      <CameraSource onFile={onFileSource} 
          className='flex-1 min-w-fit h-32'/>
    }
    <LocalSource onFile={onFileSource} 
          className='flex-1 min-w-fit h-32'/>
    <UrlSource onFinish={onUrlSource} 
          className='flex-1 min-w-fit h-32'/>
    <GallerySource onFinish={onUrlSource} 
          className='flex-1 min-w-fit h-32' />
  </div>

  <ShowIf show={editSrc}>
    <ImageEditor 
        onComplete={onCompleteEditing} 
        name={editSrcName} source={editSrc} 
        className='w-full mt-6 
                  shelf-border-color border
                bg-slate-200 dark:bg-slate-200/10
                  rounded-3xl overflow-clip'  />
  </ShowIf>

  <Images 
      urls={urls} 
      uploads={uploads} 
      onImageOrder={onImageOrder} 
      onImageClick={onImageClick} 
      onImageRemove={onImageRemove} />
</div>
  )
}

/**
 * `Images` manages images thumbnails and uploads.
 * 

 */
const Images = (
  { 
    urls, uploads, onImageClick, onImageRemove, 
    onImageOrder, className, ...rest
  }: ImagesParams
) => {

  /// DRAG PROTO
  const [draggedOver, setDraggedOver] = useState(-1)
  const [dragOrigin, setDragOrigin] = useState(-1);
  const e_drag = useRef<DragEnterEvent>(undefined);

  const dragEnter = useCallback(
    (ix: number, ev: DragEnterEvent) => {
      e_drag.current = ev
      ev.dragElem.style.display = 'block'
      setDraggedOver(ix)
    }, []
  );

  const dragLeave = useCallback(
    (ix: number, ev: DragLeaveEvent) => {
      if(draggedOver == ix)
        setDraggedOver(-1)
    }, [draggedOver]
  );

  const onHit = useCallback(
    (ix: number, e: ReactDropEvent) => {
      setDraggedOver(-1)
      onImageOrder(ix, parseInt(e.dragData))
    }, [onImageOrder]
  );

  const onDragEnd = useCallback(
    (dragData, container, x, y) => {
      if(e_drag.current?.dragElem)
        e_drag.current.dragElem.style.display = 'none'
      e_drag.current = undefined
    }, []
  )

  
  return (
<div className='w-full overflow-x-auto h-fit mt-6'>
  <div className='text-gray-400 whitespace-pre-wrap 
                    text-sm tracking-wider flex flex-col gap-1' >
    <div className=''>
      <span children='tip' 
            className='rounded-md inline --border px-1
                      bg-pink-50 dark:bg-pink-50/10 
                      text-kf-500 dark:text-kf-400  '/> 
      &nbsp;Click on an image icon to open the image editor.
    </div>
    <div className=''>
      <span children='tip' 
            className='rounded-md inline --border px-1
                      bg-pink-50 dark:bg-pink-50/10 
                      text-kf-500 dark:text-kf-400  '/> 
      &nbsp;Drag and Drop thumbnails to change images order.
    </div>
  </div>
  <HR className='my-4' />
  <div className='flex flex-row justify-start flex-wrap w-full
                  h-fit gap-3 '>
    { 
    uploads?.map(
      (u, ix) => (
        <div className='py-3 w-24 h-24 relative --bg-red-200' key={ix}>
          <div className='relative w-20 h-20'>
            <Img 
                src={u.preview} 
                crossOrigin='anonymous'
                className='object-cover w-20 h-20 rounded-xl shadow-lg 
                            border border-black opacity-30 relative'/>
            <div className='w-full h-full --bg-red-400 absolute top-0 flex 
                          flex-row animate-spin justify-center items-center'>
              <AiOutlineLoading3Quarters className='text-5xl text-gray-500' />  
            </div>                    
          </div>
        </div>
      )        
    )
    }
    {
    urls?.map(
      (u, ix) => (
        <DragDropContainer 
            key={`urls_draggable_${ix + uploads.length}`}
            dragData={ix}
            dragClone={true}
            targetKey="obi"
            onDragEnd={onDragEnd}>
          <DropTarget 
              onDragEnter={e => dragEnter(ix, e)}
              onDragLeave={e => dragLeave(ix, e)}
              onHit={e => onHit(ix, e)}
              targetKey="obi">
            <div className='py-3 w-24 h-24 relative'
                  id={`urls_draggable_${ix + uploads.length}`}>

              <Img 
                  src={u} 
                  onClick={e => onImageClick(ix)} 
                  crossOrigin='anonymous'
                  className={'object-cover cursor-pointer w-20 h-20 rounded-xl \
                              ---transition-transform \
                            shadow-lg border-2 border-black opacity-100 ' 
                            + ((dragOrigin!=ix && draggedOver==ix) ? 'border-kf-500 scale-110 ' : '')} />
              <AiFillCloseCircle 
                  onClick={e => onImageRemove(ix)} 
                  className='text-black dark:text-gray-400 cursor-pointer 
                              text-2xl absolute top-0 right-0'/>
            </div>
          </DropTarget>
        </DragDropContainer>
      )        
    )
    }
  </div>
</div>
  )
}

export default Media