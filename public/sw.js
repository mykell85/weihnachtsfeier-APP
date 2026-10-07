self.addEventListener("push",event=>{
  let data={title:"🎄 MOB-Weihnachten",body:"Neue Nachricht",url:"/"};
  try{data={...data,...event.data.json()}}catch{}
  event.waitUntil(self.registration.showNotification(data.title,{
    body:data.body,
    icon:"/icon-192.png",
    badge:"/icon-192.png",
    data:{url:data.url||"/"},
    tag:"mob-xmas",
    renotify:true
  }));
});
self.addEventListener("notificationclick",event=>{
  event.notification.close();
  event.waitUntil(clients.matchAll({type:"window",includeUncontrolled:true}).then(list=>{
    const url=event.notification.data?.url||"/";
    for(const client of list){if("focus" in client){client.navigate(url);return client.focus();}}
    if(clients.openWindow)return clients.openWindow(url);
  }));
});