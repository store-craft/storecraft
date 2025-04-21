import ReactCrop, { Crop, PercentCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import { BiRotateRight, BiMove, BiCrop } from 'react-icons/bi'
import { AiFillCheckCircle, AiFillCloseCircle } from 'react-icons/ai'
import { FiMinusCircle, FiPlusCircle } from 'react-icons/fi'
import { forwardRef, useCallback, 
  useImperativeHandle, useRef, useState } from 'react'
import { CgOptions } from 'react-icons/cg'
import useToggle from '@/hooks/use-toggle'
import Drawer from './drawer'
import Img from './img'

/**
 * A simple switch view for image editor
 */
export type SwitchParams = {
  left: boolean;
  onSwitch: (value: boolean) => void;
} & React.ComponentProps<'div'>;;

export type OptionsParams = {
  header: string;
  selectedDefault?: number;
  options?: EditingOptions[keyof EditingOptions][];
};

export type OptionsImpInterface = {
  get: () => string | number;
};

/**
 * image editor options
 */
export type EditingOptions = {
  format: "jpeg" | "png" | "webp";
  quality: 0.5 | 0.75 | 0.8 | 0.9 | 1;
  height: 128 | 256 | 384 | 512 | 640 | 768 | 896 | 1024;
};

/**
 * params given to top-panel
 */
export type TransformValues = {
  scale: number;
  rotate: number;
  trans: {
      x: number;
      y: number;
  };
  mode: "crop" | "move";
};

/**
 * `TopPanel` view of image editor
 */
export type TopPanelParams = {
  /**
   * current values
   */
  values: TransformValues;
  /**
   * notify editing action
   */
  notify: (values: TransformValues) => void;
  /**
   * notify close
   */
  onComplete: ImageEditorParams["onComplete"];
  /**
   * approve editing
   */
  onEditingApproved: (options: EditingOptions) => void;
} & React.ComponentProps<'div'>;

/**
 * `ImageEditor` is a simple and effective image editor, supports:
 * - Transformations: `translate`, `rotate`, `scale`
 * - Save as: 'jpeg', 'png', 'webp'
 * - Height: 128, 256, 384, 512, 640, 768, 896, 1024
 * - Adjustable Quality for lossy formats
 */
export type ImageEditorParams = {
  source: string;
  name: string;
  onComplete: (
    blob?: Blob, 
    format?: EditingOptions["format"], 
    name?: string, width?: number, height?: number
  ) => void;
} & React.ComponentProps<'div'>;


export const Switch = (
  { 
    left: $left = true, onSwitch, children, className, ...rest 
  }: SwitchParams
) => {

  const [left, setToggle] = useState($left)
  const onClickInternal = useCallback(
    () => {
      setToggle(
        t => {
          onSwitch(!t);
          return !t;
        }
      )      
    }, [onSwitch]
  );

  let cls_container = `p-0 relative transition-all duration-300 
                      border border-gray-400 rounded-full cursor-pointer 
                      w-14 h-7 sm:w-24 sm:h-12 flex flex-row 
                      ${className} `
  const cls_all = `absolute  w-1/2 h-full `
  const cls_anim = 'transition-all duration-300'
  const cls_toggle = !left ? 'top-0 left-1/2' : 'top-0 left-px'
  const cls = cls_all + ' ' + cls_toggle + ' ' + cls_anim

  return (
<div 
    className={cls_container} 
    onClick={onClickInternal} 
    {...rest}>
  <div className={`${cls} pr-px pb-px pt-px`} >
    <div className='relative rounded-full w-full h-full 
                  bg-gray-50 dark:bg-gray-800 border 
                    border-gray-400' />
  </div>    
  <div className='flex flex-row justify-between w-full 
                  h-full items-center z-10'
       children={children}/>
</div>    
  )
}


const Options = forwardRef(
  (
    {
      header='??', selectedDefault=0, options=[], ...rest 
    }: OptionsParams, 
    ref
  ) => {

  const [selected, setSelected] = useState(selectedDefault)

  useImperativeHandle(
    ref, 
    () => (
      {
        get: () => options[selected]
      }
    ),
    [options, selected]
  )

  return (
<div className='flex flex-col gap-1'>
  <p children={header} className='tracking-wider font-bold' />
  <div className='flex flex-row flex-wrap gap-1'>
    {
      options.map(
        (it, ix) => (
          <div 
              key={it} children={it} 
              className={
                `rounded-md shelf-border-color border px-2 py-px
                cursor-pointer 
                ${selected==ix ? 'bg-black/10 dark:bg-black/50' : 'bg-transparent'}`
              } 
              onClick={_ => setSelected(ix)} />
        )
      )
    }
  </div>
</div>    
  )
  }
)


const TopPanel = (
  { 
    values, notify, onComplete, onEditingApproved, className, ...rest 
  }: TopPanelParams
) => {

  const [open, toggle] = useToggle(false);
  const ref_format = useRef<OptionsImpInterface>(undefined);
  const ref_quality = useRef<OptionsImpInterface>(undefined);
  const ref_height = useRef<OptionsImpInterface>(undefined);

  const onEditingApprovedInternal = useCallback(
    () => {
      const options = {
        format: ref_format.current.get() as EditingOptions["format"],
        quality: ref_quality.current.get() as EditingOptions["quality"],
        height: ref_height.current.get() as EditingOptions["height"],
      } satisfies EditingOptions

      onEditingApproved && onEditingApproved(options)
    }, [onEditingApproved]
  );

  return (
<div className='w-full'>

  <div className={`flex flex-row justify-between items-center w-full 
                  py-3 px-3 text-xl sm:text-2xl
                  rounded-t-3xl ${className}`} {...rest}>
    <CgOptions onClick={toggle} 
          className={`cursor-pointer rounded-full text-3xl p-1
            ${open ? 'bg-white dark:bg-white/10' : ''}  `} />  

    <FiMinusCircle onClick={() => notify({...values, scale: values.scale/2.0})}
                  className='cursor-pointer text-xl sm:text-2xl' 
                  title='Scale Down'
                  />
    <FiPlusCircle onClick={() => notify({...values, scale: values.scale*2.0})} 
                  className='cursor-pointer text-xl sm:text-2xl'
                  title='Scale Up'
                  />
    <Switch 
        onSwitch={(left) => notify({...values, mode: left ? 'move' : 'crop'})}
        left={values?.mode==='move' ? true: false}>
      <BiMove 
          className='cursor-pointer text-xl translate-x-1
                        scale-90 sm:translate-x-[14px]'
          title='Move' />
      <BiCrop 
          className='cursor-pointer text-xl scale-90 
                        -translate-x-1 sm:scale-105 
                        sm:-translate-x-[13px]' 
          title='Crop' />
    </Switch>

    <BiRotateRight 
        onClick={() => notify({...values, rotate: values.rotate+90})}
        className='cursor-pointer text-2xl'
        title='Rotate Right'
        />
    <AiFillCloseCircle 
        onClick={() => onComplete(undefined)} 
        className='cursor-pointer text-xl sm:text-2xl' 
        title='Close'
    />
    <AiFillCheckCircle 
        onClick={onEditingApprovedInternal} 
        className='cursor-pointer text-xl sm:text-2xl' 
        title='Approve'
        />
  </div> 
  <Drawer open={open} >
    <div className='p-3 h-fit flex flex-col gap-2 bg-white/50 dark:bg-white/5'>
      <Options 
          header='Format' selectedDefault={0} 
          ref={ref_format}
          options={['jpeg', 'png', 'webp']}  />
      <Options 
          header='Quality' selectedDefault={1} 
          ref={ref_quality}
          options={[0.5, 0.75, 0.8, 0.9, 1.0]}  />
      <Options 
          header='Height' selectedDefault={3} 
          ref={ref_height}
          options={[128, 256, 384, 512, 640, 768, 896, 1024 ]} />
    </div>
  </Drawer>

</div>        
  )
}

const INITAL_PANEL: TransformValues = {
  scale: 1.0,
  rotate: 0.0,
  trans : { x: 0.0, y: 0.0 },
  mode: 'crop',
} as const;


/**
 * `ImageEditor` is a simple and effective image editor, supports:
 * - Transformations: `translate`, `rotate`, `scale`
 * - Save as: 'jpeg', 'png', 'webp'
 * - Height: 128, 256, 384, 512, 640, 768, 896, 1024
 * - Adjustable Quality for lossy formats
 * 
 */
const ImageEditor = (
  { 
    source, name, onComplete, className, ...rest 
  }: ImageEditorParams
) => {

  const imgRef = useRef(null)
  const [completedCrop, setCompletedCrop] = useState<PercentCrop>()
  const [crop, setCrop] = useState<Crop>();
  const ref_xy = useRef<React.PointerEvent>(undefined);
  const [processing, setProcessing] = useState(false)
  const [panelValues, setPanelValues] = useState(INITAL_PANEL)

  const onImageLoad: React.ReactEventHandler<HTMLImageElement> = useCallback(
    (e) => {
      // const { width, height } = e.currentTarget
      setCrop(
        {
          unit: '%', x: 0, y: 0, width: 100, height: 100
        }
      );
    }, []
  );

  const onEditingApproved = useCallback(
    (options: EditingOptions) => {
      const image = imgRef.current
      const canvas = document.createElement("canvas")
      const { rotate, trans, scale } = panelValues
      // const crop = completedCrop
      // const crop = completedCrop

      console.log('completedCrop', completedCrop)

      const crop: Partial<PercentCrop> = {
        width: (image.width * completedCrop.width)/100,
        height: (image.height * completedCrop.height)/100,
        x: (image.width * completedCrop.x)/100,
        y: (image.height * completedCrop.y)/100,
      }

      // crop.x *=2;
      // crop.y *=2;
      // crop.width *=2;
      // crop.height *=2;

      const ctx = canvas.getContext('2d');
      const TO_RADIANS = Math.PI / 180.0;

      console.log('options', options)
      // return
    
      if (!ctx) 
        throw new Error('No 2d context')
      const inw = image.naturalWidth, inh = image.naturalHeight
      const maxWidth = inw
      const maxHeight = options.height ?? inh
    
      const constraint_scale = Math.min(1.0, maxWidth / inw, maxHeight / inh)
    
      const scaleX = inw / image.width
      const scaleY = inh / image.height
      // const pixelRatio = window.devicePixelRatio * constraint_scale
      const pixelRatio = constraint_scale

      canvas.width = Math.floor(crop.width * scaleX * pixelRatio)
      canvas.height = Math.floor(crop.height * scaleY * pixelRatio)

      console.log('h ', inh, pixelRatio, canvas.height)
      // return

      ctx.fillStyle = options.format==='jpeg' ? 'white' : 'transparent'
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.scale(pixelRatio, pixelRatio)
      ctx.imageSmoothingQuality = 'high'
      const cropX = crop.x * scaleX
      const cropY = crop.y * scaleY
      const rotateRads = rotate * TO_RADIANS
      const centerX = image.naturalWidth / 2
      const centerY = image.naturalHeight / 2
      ctx.save()
      ctx.translate(-cropX, -cropY)
    
      ctx.translate(trans.x * scaleX, trans.y * scaleY)
    
      ctx.translate(centerX, centerY)
      ctx.scale(scale, scale)
      ctx.rotate(rotateRads)
      ctx.translate(-centerX, -centerY)
    
      ctx.drawImage(image,
        0, 0, inw, inh, 
        0, 0, inw, inh, 
      )
      ctx.restore()
    
      setProcessing(true)
      canvas.toBlob(
        blob => {
          // var file = new File([blob], "MyJPEG.jpg", {type: "application/octet-stream"});
          setProcessing(false)
          onComplete(
            blob, options.format, name, 
            canvas.width, canvas.height
          );
          // window.location = URL.createObjectURL(file);
        }, 
        `image/${options.format}`, 
        options.quality
      );

    }, 
    [completedCrop, panelValues, name, onComplete]
  )

  // touch
  const ref_a = useRef<HTMLDivElement>(undefined)
  const isCropMode = panelValues.mode === 'crop'

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if(isCropMode)
        return
      e.preventDefault()
      e.stopPropagation()
      // console.log('down: ', e);
      ref_xy.current = e

      const onPointerMove = (e: React.PointerEvent) => {
        e.preventDefault()
        if (ref_xy.current===undefined) {
          return
        }
  
        setPanelValues(
          { 
            ...panelValues, 
            trans: {
              x: panelValues.trans.x + (e.pageX-ref_xy.current.pageX),
              y: panelValues.trans.y + (e.pageY-ref_xy.current.pageY),
            }
          }
        );
      }

      const onPointerUp = (e: React.PointerEvent) => {
        e.preventDefault()
        e.stopPropagation()
        // console.log('up: ', e);
        ref_xy.current = undefined
        ref_a.current.removeEventListener("pointermove", onPointerMove as unknown as EventListener);
        ref_a.current.removeEventListener("pointerup", onPointerUp as unknown as EventListener);
        ref_a.current.removeEventListener("pointerdown", onPointerDown as unknown as EventListener);
      }

      ref_a.current.addEventListener("pointermove", onPointerMove as unknown as EventListener);
      ref_a.current.addEventListener("pointerup", onPointerUp as unknown as EventListener);
    }, [panelValues]
  )

  return (
<div className={className} {...rest}>
  <TopPanel 
    values={panelValues} 
    notify={setPanelValues} 
    onComplete={onComplete} 
    onEditingApproved={onEditingApproved} />
  <div 
    className='w-full touch-none' 
    ref={ref_a}
    onPointerDown={isCropMode ? undefined : onPointerDown} >

    <ReactCrop
      disabled={!isCropMode}
      ruleOfThirds
      className='m-0 w-full'
      crop={crop}
      onChange={(_, percentCrop) => setCrop(percentCrop)}
      onComplete={(pix, perc) => setCompletedCrop(perc)}
      aspect={undefined} >
      <Img
        crossOrigin='anonymous'
        className='w-full m-0'
        ref={imgRef}
        alt="Crop me"
        src={source}
        style={
          { 
          transform: `translate(${panelValues.trans.x}px, ${panelValues.trans.y}px) 
                      scale(${panelValues.scale}) 
                      rotate(${panelValues.rotate}deg) ` 
          }
        }
        onLoad={onImageLoad}
      />
    </ReactCrop>
  </div>
  <input 
    value={name} readOnly
    className='w-full p-3 mt-0 whitespace-pre break-words 
                --rounded-b-3xl --border 
                bg-transparent
                dark:border-slate-600
                '
  />
</div>
  )
}

export default ImageEditor