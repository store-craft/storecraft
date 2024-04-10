import ReactCrop from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import { BiRotateRight, BiMove, BiCrop } from 'react-icons/bi/index.js'
import { AiFillCheckCircle, AiFillCloseCircle } from 'react-icons/ai/index.js'
import { FiMinusCircle, FiPlusCircle } from 'react-icons/fi/index.js'
import { forwardRef, useCallback, 
  useImperativeHandle, useRef, useState } from 'react'
import { CgOptions } from 'react-icons/cg/index.js'
import useToggle from '@/admin/hooks/useToggle.js'
import Drawer from './drawer.jsx'
import Img from './Img.jsx'

/**
 * A simple switch view for image editor
 * 
 * @typedef {object} SwitchParams
 * @prop {boolean} left
 * @prop {(value: boolean) => void} onSwitch
 * 
 * @param {SwitchParams & 
 *  React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>
 * } params
 * 
 */
export const Switch = (
  { 
    left: $left = true, onSwitch, children, className, ...rest 
  }
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

/**
 * @typedef {object} EditingOptions image editor options
 * @property {'jpeg' | 'png' | 'webp'} format
 * @property {0.5 | 0.75 | 0.8 | 0.9 | 1.0} quality
 * @property {128 | 256 | 384 | 512 | 640 | 768 | 896 | 1024 } height
 */

const Options = forwardRef(
  /**
   * 
   * @typedef {object} OptionsParams
   * @prop {string} header
   * @prop {number} [selectedDefault=0]
   * @prop {EditingOptions[keyof EditingOptions][]} [options=[]]
   * 
   * 
   * @typedef {object} OptionsImpInterface
   * @prop {() => string} get
   * 
   * 
   * @param {OptionsParams} params
   * @param {*} ref 
   * 
   */
  (
    {
      header='??', selectedDefault=0, options=[], ...rest 
    }, ref
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
          <div key={it} children={it} className={
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

/**
 * @typedef {object} TransformValues params given to top-panel
 * @prop {number} scale
 * @prop {number} rotate
 * @prop {{x: number, y: number}} trans
 * @prop {'crop' | 'move'} mode
 */

/**
 * `TopPanel` view of image editor
 * 
 * @typedef {object} InnerTopPanelParams
 * @prop {TransformValues} values current values
 * @prop {(values: TransformValues) => void} notify notify editing action
 * @prop {ImageEditorParams["onComplete"]} onComplete notify close
 * @prop {(options: EditingOptions) => void} onEditingApproved approve editing
 * 
 * @typedef {InnerTopPanelParams & 
 *  React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>
 * } TopPanelParams
 * 
 * @param {TopPanelParams} params
 * 
 */
const TopPanel = (
  { 
    values, notify, onComplete, onEditingApproved, className, ...rest 
  }
) => {

  const [open, toggle] = useToggle(false);
  /** @type {React.MutableRefObject<OptionsImpInterface>} */
  const ref_format = useRef();
  /** @type {React.MutableRefObject<OptionsImpInterface>} */
  const ref_quality = useRef();
  /** @type {React.MutableRefObject<OptionsImpInterface>} */
  const ref_height = useRef();

  const onEditingApprovedInternal = useCallback(
    () => {
      /** @type {EditingOptions} */
      const options = {
        format: ref_format.current.get(),
        quality: ref_quality.current.get(),
        height: ref_height.current.get(),
      }

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

/**
 * @type {TransformValues}
 */
const INITAL_PANEL = {
  scale: 1.0,
  rotate: 0.0,
  trans : { x: 0.0, y: 0.0 },
  mode: 'crop',
}

/**
 * @template T
 * @typedef {ReturnType<typeof useState<T>>} useStateInfer
 */

/**
 * `ImageEditor` is a simple and effective image editor, supports:
 * - Transformations: `translate`, `rotate`, `scale`
 * - Save as: 'jpeg', 'png', 'webp'
 * - Height: 128, 256, 384, 512, 640, 768, 896, 1024
 * - Adjustable Quality for lossy formats
 * 
 * @typedef {object} InnerImageEditorParams
 * @prop {string} source
 * @prop {string} name
 * @prop {(
 *  blob?: Blob, format?: EditingOptions["format"], 
 *  name?: string, width?: number, height?: number
 * ) => void
 * } onComplete
 * 
 * @typedef {InnerImageEditorParams & 
 *  React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>
 * } ImageEditorParams
 * 
 * @param {ImageEditorParams} params 
 * 
 */
const ImageEditor = (
  { 
    source, name, onComplete, className, ...rest 
  }
) => {

  const imgRef = useRef(null)
  /** @type {useStateInfer<import('react-image-crop/index.js').Crop>} */
  const [completedCrop, setCompletedCrop] = useState()
  /** @type {useStateInfer<import('react-image-crop/index.js').Crop>} */
  const [crop, setCrop] = useState();
  /** @type {import('react').MutableRefObject<import('react').PointerEvent>} */
  const ref_xy =  useRef(undefined)
  const [processing, setProcessing] = useState(false)
  const [panelValues, setPanelValues] = useState(INITAL_PANEL)

  /** @type {import('react').ReactEventHandler<HTMLImageElement>} e  */
  const onImageLoad = useCallback(
    (e) => {
      const { width, height } = e.currentTarget
      setCrop(
        {
          unit: '%', x: 0, y: 0, width: 100, height: 100
        }
      );
    }, []
  );

  const onEditingApproved = useCallback(
    /** @param {EditingOptions} options */
    (options) => {
      const image = imgRef.current
      const canvas = document.createElement("canvas")
      const { rotate, trans, scale } = panelValues
      const crop = completedCrop
      const ctx = canvas.getContext('2d')
      const TO_RADIANS = Math.PI / 180.0

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
  /** @type {import('react').LegacyRef<HTMLDivElement>} */
  const ref_a = useRef()
  const isCropMode = panelValues.mode === 'crop'

  const onPointerDown = useCallback(
    /**
     * @param {import('react').PointerEvent} e 
     */    
    (e) => {
      if(isCropMode)
        return
      e.preventDefault()
      e.stopPropagation()
      // console.log('down: ', e);
      ref_xy.current = e

      /**
       * @param {import('react').PointerEvent} e 
       */
      const onPointerMove = e => {
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

      /**
       * @param {import('react').PointerEvent} e 
       */
      const onPointerUp = (e) => {
        e.preventDefault()
        e.stopPropagation()
        // console.log('up: ', e);
        ref_xy.current = undefined
        ref_a.current.removeEventListener("pointermove", onPointerMove);
        ref_a.current.removeEventListener("pointerup", onPointerUp);
        ref_a.current.removeEventListener("pointerdown", onPointerDown);
      }

      ref_a.current.addEventListener("pointermove", onPointerMove);
      ref_a.current.addEventListener("pointerup", onPointerUp);
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
        kkeepSelection
        ruleOfThirds
        className='m-0 w-full'
        crop={crop}
        onChange={(_, percentCrop) => setCrop(percentCrop)}
        onComplete={(c) => setCompletedCrop(c)}
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
                  '/>
</div>
  )
}

export default ImageEditor