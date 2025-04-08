import { Children, useEffect, useRef, useState } from "react";

export const Splitter = (
  {
    children, ...rest
  }: React.ComponentProps<'div'>
) => {

  const [isMoving, setIsMoving] = useState(false);

  const ref_sep = useRef<HTMLDivElement>(null);
  const ref_left = useRef<HTMLDivElement>(null);
  const ref_right = useRef<HTMLDivElement>(null);

  const chs = Children.toArray(children);


  useEffect(
    () => {
      // Two variables for tracking positions of the cursor
      const direction = 'H';
      const drag = { x : 0, y : 0 };
      const delta = { x : 0, y : 0 };
      /* If present, the handler is where you move the DIV from
          otherwise, move the DIV from anywhere inside the DIV */
      ref_sep.current.onmousedown = dragMouseDown;
    
      /**
       * A function that will be called whenever the down event of the mouse is raised
       */
      function dragMouseDown(e: MouseEvent)
      {
        drag.x = e.clientX;
        drag.y = e.clientY;
        document.onmousemove = onMouseMove;
        document.onmouseup = () => { 
          setIsMoving(false);
          document.onmousemove = document.onmouseup = null; 
        }
        return true;
      }
    
      /**
       * A function that will be called whenever the up event of the mouse is raised
       */
      function onMouseMove(e: MouseEvent)
      {
        setIsMoving(true);

        if(!ref_sep.current)
          return;

        const currentX = e.clientX;
        const currentY = e.clientY;
    
        delta.x = currentX - drag.x;
        delta.y = currentY - drag.y;
    
        const offsetLeft = ref_sep.current.offsetLeft;
        const offsetTop = ref_sep.current.offsetTop;
    
        let firstWidth = ref_left.current.offsetWidth;
        let secondWidth = ref_right.current.offsetWidth;
        if (direction === "H" ) // Horizontal
        {
            ref_sep.current.style.left = offsetLeft + delta.x + "px";
            firstWidth += delta.x;
            secondWidth -= delta.x;
        }
        drag.x = currentX;
        drag.y = currentY;
        ref_left.current.style.width = firstWidth + "px";
        ref_right.current.style.width = secondWidth + "px";

        return true;
      }

      return () => {
        ref_sep.current && (ref_sep.current.onmousedown = undefined);
      }
    }, []
  );

  return (
    <div {...rest}>
      <div className='w-full h-full flex flex-row'>
        <div 
            children={chs[0]} 
            className={'w-1/2 flex-grow ' + (isMoving ? 'pointer-events-none' : '')} 
            ref={ref_left} />
        <div 
            className='h-full w-[10px] gap-px flex flex-row items-center justify-evenly 
                      bg-gray-500 cursor-col-resize' 
            ref={ref_sep} >
          <span className='w-1 h-10 bg-black/80' />
        </div>
        <div 
            children={chs[1]} 
            className={'w-1/2 ' + (isMoving ? 'pointer-events-none' : '')} 
            ref={ref_right}/>
      </div>
    </div>
  )
}
