// Appears Title Screen
window.addEventListener('load', () => {
  let title_header = document.getElementsByTagName('header')[0] as unknown as HTMLHeadingElement;
  const transition_time = 5;
  title_header.style.opacity = '1';
  title_header.style.transitionDuration = transition_time + 's';
});
