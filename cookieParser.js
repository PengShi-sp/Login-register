/**
 *  domain:'localhost', Domain
 path:'/read',Path
 httpOnly:true,HttpOnly
 maxAge:3600, Max-Age
 expires: Expires
 Secure:true Secure
 最好判断一下传进来的规则，以免传进来的有问题导致报错
 */
exports.serialize = function(name,val,opt){
    opt = opt ||{};
    var pairs = [name+'='+val];
    if(opt.maxAge){
        pairs.push('Max-Age='+opt.maxAge);
    }
    if(opt.domain) pairs.push('Domain='+opt.domain);
    if(opt.path) pairs.push('Path='+opt.path);
    if(opt.expires) pairs.push('Expires='+opt.expires.toGMTString());
    if(opt.httpOnly) pairs.push('HttpOnly');
    if(opt.secure) pairs.push('Secure');
    return pairs.join('; ');
};