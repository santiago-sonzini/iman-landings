// The demo video on a service page: plays while it is on screen and lights up the step it is showing.
(() => {
  'use strict';
  const video=document.querySelector('.demo-video');
  if(!video)return;
  const steps=[...document.querySelectorAll('.demo-steps li')], times=steps.map(li=>Number(li.dataset.at));
  const mark=()=>{
    let current=0;times.forEach((at,i)=>{if(video.currentTime>=at)current=i;});
    steps.forEach((li,i)=>li.classList.toggle('on',i===current));
  };
  video.addEventListener('timeupdate',mark);mark();
  // Tapping a step jumps to that moment of the conversation.
  steps.forEach((li,i)=>li.addEventListener('click',()=>{video.currentTime=times[i];video.play().catch(()=>{});}));
  if(matchMedia('(prefers-reduced-motion: reduce)').matches){video.controls=true;video.loop=false;return;}
  new IntersectionObserver(([entry])=>{entry.isIntersecting?video.play().catch(()=>{video.controls=true;}):video.pause();},{threshold:.35}).observe(video);
})();
